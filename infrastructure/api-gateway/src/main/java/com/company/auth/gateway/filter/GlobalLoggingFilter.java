package com.company.auth.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

@Component
public class GlobalLoggingFilter implements GatewayFilter {

    private static final Logger logger = LoggerFactory.getLogger(GlobalLoggingFilter.class);
    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        
        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        String traceId = getOrGenerateTraceId(request);

        // Set MDC for structured logging
        MDC.put("requestId", requestId);
        MDC.put("traceId", traceId);
        MDC.put("method", request.getMethod().toString());
        MDC.put("path", request.getPath().value());
        MDC.put("remoteAddress", getClientIp(request));

        // Add correlation headers
        ServerHttpRequest modifiedRequest = request.mutate()
            .header("X-Request-Id", requestId)
            .header("X-Trace-Id", traceId)
            .build();

        ServerWebExchange modifiedExchange = exchange.mutate()
            .request(modifiedRequest)
            .build();

        // Log incoming request
        logIncomingRequest(request, requestId, traceId);

        return chain.filter(modifiedExchange)
            .doOnSuccess(aVoid -> {
                long duration = System.currentTimeMillis() - startTime;
                logOutgoingResponse(request, response, requestId, traceId, duration);
                logAuditEvent(request, response, requestId, traceId, duration);
            })
            .doOnError(error -> {
                long duration = System.currentTimeMillis() - startTime;
                logError(request, error, requestId, traceId, duration);
            })
            .doFinally(signalType -> {
                // Clear MDC
                MDC.clear();
            });
    }

    private String getOrGenerateTraceId(ServerHttpRequest request) {
        String existingTraceId = request.getHeaders().getFirst("X-Trace-Id");
        if (StringUtils.hasText(existingTraceId)) {
            return existingTraceId;
        }

        // Check for B3 tracing headers
        String b3TraceId = request.getHeaders().getFirst("X-B3-TraceId");
        if (StringUtils.hasText(b3TraceId)) {
            return b3TraceId;
        }

        return UUID.randomUUID().toString().replace("-", "");
    }

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddress() != null ? 
            request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
    }

    private void logIncomingRequest(ServerHttpRequest request, String requestId, String traceId) {
        String userAgent = request.getHeaders().getFirst("User-Agent");
        String userId = request.getHeaders().getFirst("X-User-Id");
        
        logger.info("Incoming request - Method: {}, Path: {}, RemoteIP: {}, UserAgent: {}, UserId: {}",
            request.getMethod(),
            request.getPath().value(),
            getClientIp(request),
            userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 100)) : "unknown",
            userId != null ? userId : "anonymous"
        );
    }

    private void logOutgoingResponse(ServerHttpRequest request, ServerHttpResponse response,
                                   String requestId, String traceId, long duration) {
        String userId = request.getHeaders().getFirst("X-User-Id");
        
        logger.info("Outgoing response - Status: {}, Duration: {}ms, UserId: {}",
            response.getStatusCode() != null ? response.getStatusCode().value() : "unknown",
            duration,
            userId != null ? userId : "anonymous"
        );
    }

    private void logAuditEvent(ServerHttpRequest request, ServerHttpResponse response,
                              String requestId, String traceId, long duration) {
        
        // Only audit non-health check endpoints
        String path = request.getPath().value();
        if (path.startsWith("/actuator/")) {
            return;
        }

        String userId = request.getHeaders().getFirst("X-User-Id");
        String sessionId = request.getHeaders().getFirst("X-Session-Id");
        int statusCode = response.getStatusCode() != null ? response.getStatusCode().value() : 0;

        auditLogger.info("API_ACCESS {} {} {} {} {} {} {} {} {}",
            Instant.now(),
            requestId,
            traceId,
            userId != null ? userId : "anonymous",
            sessionId != null ? sessionId : "no-session",
            request.getMethod(),
            path,
            statusCode,
            duration
        );
    }

    private void logError(ServerHttpRequest request, Throwable error, 
                         String requestId, String traceId, long duration) {
        String userId = request.getHeaders().getFirst("X-User-Id");
        
        logger.error("Request failed - Error: {}, Duration: {}ms, UserId: {}",
            error.getMessage(),
            duration,
            userId != null ? userId : "anonymous",
            error
        );

        // Audit error event
        auditLogger.error("API_ERROR {} {} {} {} {} {} {} {}",
            Instant.now(),
            requestId,
            traceId,
            userId != null ? userId : "anonymous",
            request.getMethod(),
            request.getPath().value(),
            error.getClass().getSimpleName(),
            error.getMessage()
        );
    }
}
package com.company.auth.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class AuthorizationFilter implements GatewayFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthorizationFilter.class);

    // Role-based access rules
    private final Map<String, Set<String>> roleBasedAccess = Map.of(
        "SUPER_ADMIN", Set.of("*:*"),
        "ADMIN", Set.of("user:*", "role:*", "permission:read", "audit:read"),
        "USER", Set.of("user:read-self", "user:update-self"),
        "GUEST", Set.of("public:read")
    );

    // Endpoint to permission mapping
    private final Map<String, Map<HttpMethod, String>> endpointPermissions = Map.of(
        "/api/v1/users", Map.of(
            HttpMethod.GET, "user:read",
            HttpMethod.POST, "user:create"
        ),
        "/api/v1/users/{id}", Map.of(
            HttpMethod.GET, "user:read",
            HttpMethod.PUT, "user:update",
            HttpMethod.DELETE, "user:delete"
        ),
        "/api/v1/auth/roles", Map.of(
            HttpMethod.GET, "role:read",
            HttpMethod.POST, "role:create",
            HttpMethod.PUT, "role:update",
            HttpMethod.DELETE, "role:delete"
        ),
        "/api/v1/auth/permissions", Map.of(
            HttpMethod.GET, "permission:read",
            HttpMethod.POST, "permission:create",
            HttpMethod.PUT, "permission:update",
            HttpMethod.DELETE, "permission:delete"
        ),
        "/api/v1/audit", Map.of(
            HttpMethod.GET, "audit:read"
        )
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        HttpMethod method = request.getMethod();

        // Skip authorization for public endpoints (handled by AuthenticationFilter)
        String userRolesHeader = request.getHeaders().getFirst("X-User-Roles");
        String userId = request.getHeaders().getFirst("X-User-Id");

        if (!StringUtils.hasText(userRolesHeader) || !StringUtils.hasText(userId)) {
            logger.warn("Missing user information in headers for authorization check");
            return handleForbidden(exchange, "Missing user information for authorization");
        }

        Set<String> userRoles = Arrays.stream(userRolesHeader.split(","))
            .map(String::trim)
            .collect(Collectors.toSet());

        logger.debug("Checking authorization for user: {} with roles: {} on path: {} method: {}",
            userId, userRoles, path, method);

        // Check if user has required permissions
        if (hasPermission(userRoles, path, method, userId, exchange)) {
            logger.debug("Authorization successful for user: {} on path: {}", userId, path);
            return chain.filter(exchange);
        } else {
            logger.warn("Authorization failed for user: {} on path: {} method: {}", userId, path, method);
            return handleForbidden(exchange, "Insufficient permissions");
        }
    }

    private boolean hasPermission(Set<String> userRoles, String path, HttpMethod method, 
                                String userId, ServerWebExchange exchange) {
        
        // Super admin has access to everything
        if (userRoles.contains("SUPER_ADMIN")) {
            return true;
        }

        // Check role-based permissions
        Set<String> userPermissions = userRoles.stream()
            .filter(roleBasedAccess::containsKey)
            .flatMap(role -> roleBasedAccess.get(role).stream())
            .collect(Collectors.toSet());

        // Check for wildcard permissions
        if (userPermissions.contains("*:*")) {
            return true;
        }

        // Get required permission for this endpoint
        String requiredPermission = getRequiredPermission(path, method);
        if (requiredPermission == null) {
            // If no specific permission is required, allow access for authenticated users
            return true;
        }

        // Check if user has the required permission
        if (hasSpecificPermission(userPermissions, requiredPermission)) {
            return true;
        }

        // Special case: Check if user is accessing their own resource
        if (isAccessingOwnResource(path, userId) && hasPermissionForOwnResource(userPermissions, requiredPermission)) {
            return true;
        }

        return false;
    }

    private String getRequiredPermission(String path, HttpMethod method) {
        // Normalize path by removing path variables
        String normalizedPath = normalizePath(path);
        
        Map<HttpMethod, String> methodPermissions = endpointPermissions.get(normalizedPath);
        if (methodPermissions != null) {
            return methodPermissions.get(method);
        }
        
        return null;
    }

    private String normalizePath(String path) {
        // Replace UUID patterns with {id}
        return path.replaceAll("/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", "/{id}")
                  .replaceAll("/\\d+", "/{id}");
    }

    private boolean hasSpecificPermission(Set<String> userPermissions, String requiredPermission) {
        // Check exact permission
        if (userPermissions.contains(requiredPermission)) {
            return true;
        }

        // Check wildcard permissions
        String[] parts = requiredPermission.split(":");
        if (parts.length == 2) {
            String resource = parts[0];
            String action = parts[1];
            
            // Check resource wildcard (e.g., "user:*")
            if (userPermissions.contains(resource + ":*")) {
                return true;
            }
            
            // Check action wildcard (e.g., "*:read")
            if (userPermissions.contains("*:" + action)) {
                return true;
            }
        }

        return false;
    }

    private boolean isAccessingOwnResource(String path, String userId) {
        // Check if the path contains the user's own ID
        // Pattern: /api/v1/users/{userId}
        return path.matches("/api/v1/users/" + userId + "(/.*)?");
    }

    private boolean hasPermissionForOwnResource(Set<String> userPermissions, String requiredPermission) {
        // Allow self-access permissions
        Set<String> selfAccessPermissions = Set.of(
            "user:read-self", "user:update-self"
        );

        return userPermissions.stream()
            .anyMatch(selfAccessPermissions::contains) ||
            hasSpecificPermission(userPermissions, requiredPermission);
    }

    private Mono<Void> handleForbidden(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().add("Content-Type", "application/json");
        
        String body = String.format(
            "{\"error\":\"Forbidden\",\"message\":\"%s\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
            message,
            java.time.Instant.now().toString(),
            exchange.getRequest().getPath().value()
        );

        return response.writeWith(
            Mono.just(response.bufferFactory().wrap(body.getBytes()))
        );
    }
}
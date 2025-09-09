package com.company.audit.auditservice.controller;

import com.company.audit.auditservice.dto.AuditEventDto;
import com.company.audit.auditservice.entity.AuditEvent;
import com.company.audit.auditservice.service.AuditEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit Management", description = "APIs for managing audit events and security logs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuditController {

    @Autowired
    private AuditEventService auditEventService;

    @GetMapping("/events")
    @Operation(summary = "Get all audit events with filtering and pagination")
    public ResponseEntity<Page<AuditEvent>> getAuditEvents(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "timestamp") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Filter by user ID") @RequestParam(required = false) String userId,
            @Parameter(description = "Filter by service name") @RequestParam(required = false) String serviceName,
            @Parameter(description = "Filter by event type") @RequestParam(required = false) String eventType,
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by IP address") @RequestParam(required = false) String ipAddress,
            @Parameter(description = "Start date (ISO format)") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date (ISO format)") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<AuditEvent> events;
        
        // If any filters are provided, use complex filtering
        if (userId != null || serviceName != null || eventType != null || 
            status != null || ipAddress != null || startDate != null || endDate != null) {
            
            // Set default date range if not provided
            LocalDateTime start = startDate != null ? startDate : LocalDateTime.now().minusDays(30);
            LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();
            
            events = auditEventService.getAuditEventsByFilters(
                userId, serviceName, eventType, status, ipAddress, start, end, pageable);
        } else {
            events = auditEventService.getAllAuditEvents(pageable);
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/events/{id}")
    @Operation(summary = "Get audit event by ID")
    public ResponseEntity<Object> getAuditEvent(@PathVariable Long id) {
        return auditEventService.getAuditEventById(id)
                .map(event -> ResponseEntity.ok().body((Object) event))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Audit event not found with id: " + id)));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get audit events for specific user")
    public ResponseEntity<Page<AuditEvent>> getUserAuditEvents(
            @PathVariable String userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Start date (ISO format)") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date (ISO format)") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        Page<AuditEvent> events;
        if (startDate != null && endDate != null) {
            events = auditEventService.getUserAuditEventsByDateRange(userId, startDate, endDate, pageable);
        } else {
            events = auditEventService.getUserAuditEvents(userId, pageable);
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/services/{serviceName}")
    @Operation(summary = "Get audit events for specific service")
    public ResponseEntity<Page<AuditEvent>> getServiceAuditEvents(
            @PathVariable String serviceName,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditEvent> events = auditEventService.getServiceAuditEvents(serviceName, pageable);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/security-events")
    @Operation(summary = "Get security events (failed logins, unauthorized access, etc.)")
    public ResponseEntity<Page<AuditEvent>> getSecurityEvents(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Start date (ISO format)") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date (ISO format)") @RequestParam(required = false) 
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        Page<AuditEvent> events;
        if (startDate != null && endDate != null) {
            events = auditEventService.getSecurityEventsByDateRange(startDate, endDate, pageable);
        } else {
            events = auditEventService.getSecurityEvents(pageable);
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/sessions/{sessionId}")
    @Operation(summary = "Get audit events for specific session")
    public ResponseEntity<Page<AuditEvent>> getSessionAuditEvents(
            @PathVariable String sessionId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditEvent> events = auditEventService.getSessionAuditEvents(sessionId, pageable);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/correlation/{correlationId}")
    @Operation(summary = "Get all audit events for a correlation ID")
    public ResponseEntity<List<AuditEvent>> getCorrelationAuditEvents(@PathVariable String correlationId) {
        List<AuditEvent> events = auditEventService.getCorrelationAuditEvents(correlationId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/requests/{requestId}")
    @Operation(summary = "Get audit event by request ID")
    public ResponseEntity<Object> getAuditEventByRequestId(@PathVariable String requestId) {
        return auditEventService.getAuditEventByRequestId(requestId)
                .map(event -> ResponseEntity.ok().body((Object) event))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Audit event not found with requestId: " + requestId)));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get audit statistics")
    public ResponseEntity<Map<String, Object>> getAuditStatistics(
            @Parameter(description = "Days to look back") @RequestParam(defaultValue = "30") int days) {
        
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        Map<String, Object> stats = auditEventService.getAuditStatistics(since);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users/{userId}/statistics")
    @Operation(summary = "Get user activity statistics")
    public ResponseEntity<Map<String, Long>> getUserActivityStats(
            @PathVariable String userId,
            @Parameter(description = "Days to look back") @RequestParam(defaultValue = "30") int days) {
        
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        Map<String, Long> stats = auditEventService.getUserActivityStats(userId, since);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/top-users")
    @Operation(summary = "Get most active users")
    public ResponseEntity<List<Map<String, Object>>> getTopActiveUsers(
            @Parameter(description = "Days to look back") @RequestParam(defaultValue = "30") int days,
            @Parameter(description = "Number of users to return") @RequestParam(defaultValue = "10") int limit) {
        
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Map<String, Object>> topUsers = auditEventService.getTopActiveUsers(since, limit);
        return ResponseEntity.ok(topUsers);
    }

    @PostMapping("/events")
    @Operation(summary = "Create audit event manually (for testing)")
    public ResponseEntity<AuditEvent> createAuditEvent(@RequestBody AuditEventDto auditEventDto) {
        AuditEvent auditEvent = convertToEntity(auditEventDto);
        AuditEvent savedEvent = auditEventService.createAuditEvent(auditEvent);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    // Health check endpoint
    @GetMapping("/health")
    @Operation(summary = "Health check for audit service")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);
        
        long recentEvents = auditEventService.getAuditEventsByDateRange(oneHourAgo, now, PageRequest.of(0, 1))
                .getTotalElements();
        
        Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", now,
                "recentEventsLastHour", recentEvents,
                "service", "audit-service"
        );
        
        return ResponseEntity.ok(health);
    }

    private AuditEvent convertToEntity(AuditEventDto dto) {
        AuditEvent event = new AuditEvent();
        event.setEventType(dto.getEventType());
        event.setServiceName(dto.getServiceName());
        event.setUserId(dto.getUserId());
        event.setSessionId(dto.getSessionId());
        event.setIpAddress(dto.getIpAddress());
        event.setUserAgent(dto.getUserAgent());
        event.setResource(dto.getResource());
        event.setAction(dto.getAction());
        event.setStatus(dto.getStatus());
        event.setDetails(dto.getDetails());
        event.setRequestId(dto.getRequestId());
        event.setCorrelationId(dto.getCorrelationId());
        event.setDurationMs(dto.getDurationMs());
        
        if (dto.getTimestamp() != null) {
            event.setTimestamp(dto.getTimestamp());
        }
        
        return event;
    }
}
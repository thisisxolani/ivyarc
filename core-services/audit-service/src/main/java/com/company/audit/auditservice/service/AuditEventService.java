package com.company.audit.auditservice.service;

import com.company.audit.auditservice.entity.AuditEvent;
import com.company.audit.auditservice.repository.AuditEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuditEventService {

    @Autowired
    private AuditEventRepository auditEventRepository;

    // Create audit event
    public AuditEvent createAuditEvent(AuditEvent auditEvent) {
        if (auditEvent.getTimestamp() == null) {
            auditEvent.setTimestamp(LocalDateTime.now());
        }
        return auditEventRepository.save(auditEvent);
    }

    public AuditEvent createAuditEvent(String eventType, String serviceName, String userId, 
                                     String action, String status, String details) {
        AuditEvent event = new AuditEvent(eventType, serviceName, userId);
        event.setAction(action);
        event.setStatus(status);
        event.setDetails(details);
        return createAuditEvent(event);
    }

    // Read operations
    @Transactional(readOnly = true)
    public Optional<AuditEvent> getAuditEventById(Long id) {
        return auditEventRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<AuditEvent> getAuditEventByRequestId(String requestId) {
        return auditEventRepository.findByRequestId(requestId);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getAllAuditEvents(Pageable pageable) {
        return auditEventRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getUserAuditEvents(String userId, Pageable pageable) {
        return auditEventRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getServiceAuditEvents(String serviceName, Pageable pageable) {
        return auditEventRepository.findByServiceNameOrderByTimestampDesc(serviceName, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getEventTypeAuditEvents(String eventType, Pageable pageable) {
        return auditEventRepository.findByEventTypeOrderByTimestampDesc(eventType, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getStatusAuditEvents(String status, Pageable pageable) {
        return auditEventRepository.findByStatusOrderByTimestampDesc(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getIpAddressAuditEvents(String ipAddress, Pageable pageable) {
        return auditEventRepository.findByIpAddressOrderByTimestampDesc(ipAddress, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getSessionAuditEvents(String sessionId, Pageable pageable) {
        return auditEventRepository.findBySessionIdOrderByTimestampDesc(sessionId, pageable);
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getCorrelationAuditEvents(String correlationId) {
        return auditEventRepository.findByCorrelationIdOrderByTimestampAsc(correlationId);
    }

    // Date range queries
    @Transactional(readOnly = true)
    public Page<AuditEvent> getAuditEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditEventRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getUserAuditEventsByDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditEventRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, startDate, endDate, pageable);
    }

    // Security events
    @Transactional(readOnly = true)
    public Page<AuditEvent> getSecurityEvents(Pageable pageable) {
        return auditEventRepository.findSecurityEvents(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> getSecurityEventsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditEventRepository.findSecurityEventsBetween(startDate, endDate, pageable);
    }

    // Complex filtering
    @Transactional(readOnly = true)
    public Page<AuditEvent> getAuditEventsByFilters(String userId, String serviceName, String eventType, 
                                                   String status, String ipAddress, LocalDateTime startDate, 
                                                   LocalDateTime endDate, Pageable pageable) {
        return auditEventRepository.findByFilters(userId, serviceName, eventType, status, ipAddress, 
                                                 startDate, endDate, pageable);
    }

    // Statistics and analytics
    @Transactional(readOnly = true)
    public Map<String, Object> getAuditStatistics(LocalDateTime since) {
        long totalEvents = auditEventRepository.countEventsSince(since);
        long failedEvents = auditEventRepository.countFailedEventsSince(since);
        Double avgDuration = auditEventRepository.getAverageDurationSince(since);
        
        List<Object[]> eventTypeStats = auditEventRepository.getEventTypeStatsSince(since);
        Map<String, Long> eventTypes = eventTypeStats.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
        
        List<Object[]> serviceStats = auditEventRepository.getServiceStatsSince(since);
        Map<String, Long> services = serviceStats.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        return Map.of(
                "totalEvents", totalEvents,
                "failedEvents", failedEvents,
                "successRate", totalEvents > 0 ? (double) (totalEvents - failedEvents) / totalEvents * 100 : 0,
                "averageDurationMs", avgDuration != null ? avgDuration : 0,
                "eventTypeBreakdown", eventTypes,
                "serviceBreakdown", services
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUserActivityStats(String userId, LocalDateTime since) {
        long totalEvents = auditEventRepository.countUserEventsSince(userId, since);
        
        return Map.of(
                "totalActivity", totalEvents,
                "loginEvents", auditEventRepository.countEventTypeSince("LOGIN_SUCCESS", since),
                "failedLogins", auditEventRepository.countEventTypeSince("LOGIN_FAILED", since)
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopActiveUsers(LocalDateTime since, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> topUsers = auditEventRepository.getTopUsersBySince(since, pageable);
        
        return topUsers.stream()
                .map(row -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("userId", (String) row[0]);
                    userMap.put("eventCount", (Long) row[1]);
                    return userMap;
                })
                .collect(Collectors.toList());
    }

    // Audit event for authentication events
    public void auditLoginSuccess(String userId, String sessionId, String ipAddress, String userAgent) {
        AuditEvent event = new AuditEvent("LOGIN_SUCCESS", "auth-service", userId);
        event.setSessionId(sessionId);
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        event.setAction("LOGIN");
        event.setStatus("SUCCESS");
        event.setDetails("User successfully logged in");
        createAuditEvent(event);
    }

    public void auditLoginFailed(String userId, String ipAddress, String userAgent, String reason) {
        AuditEvent event = new AuditEvent("LOGIN_FAILED", "auth-service", userId);
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        event.setAction("LOGIN");
        event.setStatus("FAILED");
        event.setDetails("Login failed: " + reason);
        createAuditEvent(event);
    }

    public void auditLogout(String userId, String sessionId, String ipAddress) {
        AuditEvent event = new AuditEvent("LOGOUT", "auth-service", userId);
        event.setSessionId(sessionId);
        event.setIpAddress(ipAddress);
        event.setAction("LOGOUT");
        event.setStatus("SUCCESS");
        event.setDetails("User logged out");
        createAuditEvent(event);
    }

    // Audit event for user management
    public void auditUserCreated(String createdByUserId, String newUserId, String details) {
        AuditEvent event = new AuditEvent("USER_CREATED", "user-management-service", createdByUserId);
        event.setAction("CREATE_USER");
        event.setStatus("SUCCESS");
        event.setDetails("Created user: " + newUserId + ". " + details);
        createAuditEvent(event);
    }

    public void auditUserUpdated(String updatedByUserId, String targetUserId, String details) {
        AuditEvent event = new AuditEvent("USER_UPDATED", "user-management-service", updatedByUserId);
        event.setAction("UPDATE_USER");
        event.setStatus("SUCCESS");
        event.setDetails("Updated user: " + targetUserId + ". " + details);
        createAuditEvent(event);
    }

    public void auditUserDeleted(String deletedByUserId, String targetUserId, String details) {
        AuditEvent event = new AuditEvent("USER_DELETED", "user-management-service", deletedByUserId);
        event.setAction("DELETE_USER");
        event.setStatus("SUCCESS");
        event.setDetails("Deleted user: " + targetUserId + ". " + details);
        createAuditEvent(event);
    }

    // Audit for unauthorized access attempts
    public void auditUnauthorizedAccess(String userId, String resource, String ipAddress, String userAgent) {
        AuditEvent event = new AuditEvent("UNAUTHORIZED_ACCESS", "api-gateway", userId);
        event.setResource(resource);
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        event.setAction("ACCESS_ATTEMPT");
        event.setStatus("UNAUTHORIZED");
        event.setDetails("Unauthorized access attempt to: " + resource);
        createAuditEvent(event);
    }
}
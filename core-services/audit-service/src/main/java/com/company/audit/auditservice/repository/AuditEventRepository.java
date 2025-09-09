package com.company.audit.auditservice.repository;

import com.company.audit.auditservice.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    // Find by user ID
    Page<AuditEvent> findByUserIdOrderByTimestampDesc(String userId, Pageable pageable);

    List<AuditEvent> findByUserIdOrderByTimestampDesc(String userId);

    // Find by service name
    Page<AuditEvent> findByServiceNameOrderByTimestampDesc(String serviceName, Pageable pageable);

    // Find by event type
    Page<AuditEvent> findByEventTypeOrderByTimestampDesc(String eventType, Pageable pageable);

    // Find by status
    Page<AuditEvent> findByStatusOrderByTimestampDesc(String status, Pageable pageable);

    // Find by IP address
    Page<AuditEvent> findByIpAddressOrderByTimestampDesc(String ipAddress, Pageable pageable);

    // Find by session ID
    Page<AuditEvent> findBySessionIdOrderByTimestampDesc(String sessionId, Pageable pageable);

    // Find by correlation ID
    List<AuditEvent> findByCorrelationIdOrderByTimestampAsc(String correlationId);

    // Find by request ID
    Optional<AuditEvent> findByRequestId(String requestId);

    // Date range queries
    Page<AuditEvent> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // User activity in date range
    Page<AuditEvent> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Security events (failed logins, unauthorized access, etc.)
    @Query("SELECT a FROM AuditEvent a WHERE " +
           "a.eventType IN ('LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY') " +
           "ORDER BY a.timestamp DESC")
    Page<AuditEvent> findSecurityEvents(Pageable pageable);

    @Query("SELECT a FROM AuditEvent a WHERE " +
           "a.eventType IN ('LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY') " +
           "AND a.timestamp BETWEEN :startDate AND :endDate " +
           "ORDER BY a.timestamp DESC")
    Page<AuditEvent> findSecurityEventsBetween(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            Pageable pageable);

    // Complex search query
    @Query("SELECT a FROM AuditEvent a WHERE " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:serviceName IS NULL OR a.serviceName = :serviceName) AND " +
           "(:eventType IS NULL OR a.eventType = :eventType) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:ipAddress IS NULL OR a.ipAddress = :ipAddress) AND " +
           "a.timestamp BETWEEN :startDate AND :endDate " +
           "ORDER BY a.timestamp DESC")
    Page<AuditEvent> findByFilters(
            @Param("userId") String userId,
            @Param("serviceName") String serviceName,
            @Param("eventType") String eventType,
            @Param("status") String status,
            @Param("ipAddress") String ipAddress,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    // Statistics queries
    @Query("SELECT COUNT(a) FROM AuditEvent a WHERE a.timestamp >= :since")
    long countEventsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM AuditEvent a WHERE a.userId = :userId AND a.timestamp >= :since")
    long countUserEventsSince(@Param("userId") String userId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM AuditEvent a WHERE a.eventType = :eventType AND a.timestamp >= :since")
    long countEventTypeSince(@Param("eventType") String eventType, @Param("since") LocalDateTime since);

    @Query("SELECT a.eventType, COUNT(a) FROM AuditEvent a WHERE a.timestamp >= :since GROUP BY a.eventType")
    List<Object[]> getEventTypeStatsSince(@Param("since") LocalDateTime since);

    @Query("SELECT a.serviceName, COUNT(a) FROM AuditEvent a WHERE a.timestamp >= :since GROUP BY a.serviceName")
    List<Object[]> getServiceStatsSince(@Param("since") LocalDateTime since);

    // Failed operations
    @Query("SELECT COUNT(a) FROM AuditEvent a WHERE a.status LIKE 'FAILED%' AND a.timestamp >= :since")
    long countFailedEventsSince(@Param("since") LocalDateTime since);

    // Average duration
    @Query("SELECT AVG(a.durationMs) FROM AuditEvent a WHERE a.durationMs IS NOT NULL AND a.timestamp >= :since")
    Double getAverageDurationSince(@Param("since") LocalDateTime since);

    // Top users by activity
    @Query("SELECT a.userId, COUNT(a) FROM AuditEvent a WHERE " +
           "a.userId IS NOT NULL AND a.timestamp >= :since " +
           "GROUP BY a.userId ORDER BY COUNT(a) DESC")
    List<Object[]> getTopUsersBySince(@Param("since") LocalDateTime since, Pageable pageable);
}
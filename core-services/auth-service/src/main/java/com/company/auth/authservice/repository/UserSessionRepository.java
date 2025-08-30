package com.company.auth.authservice.repository;

import com.company.auth.authservice.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findBySessionToken(String sessionToken);

    Optional<UserSession> findByRefreshToken(String refreshToken);

    List<UserSession> findByUserIdAndExpiresAtAfter(UUID userId, LocalDateTime now);

    List<UserSession> findByUserId(UUID userId);

    @Modifying
    @Query("UPDATE UserSession s SET s.lastAccessed = :lastAccessed WHERE s.id = :sessionId")
    void updateLastAccessed(@Param("sessionId") UUID sessionId, @Param("lastAccessed") LocalDateTime lastAccessed);

    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.userId = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.userId = :userId AND s.id != :currentSessionId")
    void deleteOtherUserSessions(@Param("userId") UUID userId, @Param("currentSessionId") UUID currentSessionId);

    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.userId = :userId AND s.expiresAt > :now")
    long countActiveSessionsByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    @Query("SELECT s FROM UserSession s WHERE s.userId = :userId AND s.expiresAt > :now ORDER BY s.lastAccessed DESC")
    List<UserSession> findActiveSessionsByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE UserSession s SET s.refreshToken = :newRefreshToken WHERE s.sessionToken = :sessionToken")
    void updateRefreshToken(@Param("sessionToken") String sessionToken, @Param("newRefreshToken") String newRefreshToken);
}
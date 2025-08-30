package com.company.auth.authservice.service;

import com.company.auth.authservice.entity.UserSession;
import com.company.auth.authservice.repository.UserSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserSessionService {

    private final UserSessionRepository sessionRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.session.max-concurrent-sessions:5}")
    private int maxConcurrentSessions;

    @Value("${app.session.expiration-hours:24}")
    private int sessionExpirationHours;

    @Autowired
    public UserSessionService(UserSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public UserSession createSession(UUID userId, String ipAddress, String userAgent) {
        String sessionToken = generateSecureToken();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusHours(sessionExpirationHours);

        long activeSessions = sessionRepository.countActiveSessionsByUserId(userId, now);
        
        if (activeSessions >= maxConcurrentSessions) {
            List<UserSession> existingSessions = sessionRepository.findActiveSessionsByUserId(userId, now);
            if (!existingSessions.isEmpty()) {
                UserSession oldestSession = existingSessions.get(existingSessions.size() - 1);
                sessionRepository.delete(oldestSession);
            }
        }

        UserSession session = new UserSession(userId, sessionToken, expiresAt, ipAddress, userAgent);
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public Optional<UserSession> findBySessionToken(String sessionToken) {
        return sessionRepository.findBySessionToken(sessionToken);
    }

    @Transactional(readOnly = true)
    public Optional<UserSession> findByRefreshToken(String refreshToken) {
        return sessionRepository.findByRefreshToken(refreshToken);
    }

    @Transactional(readOnly = true)
    public Optional<UserSession> findBySessionId(UUID sessionId) {
        return sessionRepository.findById(sessionId);
    }

    @Transactional(readOnly = true)
    public List<UserSession> findActiveUserSessions(UUID userId) {
        return sessionRepository.findByUserIdAndExpiresAtAfter(userId, LocalDateTime.now());
    }

    public boolean isSessionValid(UserSession session) {
        return session != null && 
               session.getExpiresAt().isAfter(LocalDateTime.now());
    }

    public void updateLastAccessed(UUID sessionId) {
        sessionRepository.updateLastAccessed(sessionId, LocalDateTime.now());
    }

    public void updateSessionTokens(UUID sessionId, String sessionToken, String refreshToken) {
        Optional<UserSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            session.setRefreshToken(refreshToken);
            session.setLastAccessed(LocalDateTime.now());
            sessionRepository.save(session);
        }
    }

    public void invalidateSession(String sessionToken) {
        Optional<UserSession> session = sessionRepository.findBySessionToken(sessionToken);
        session.ifPresent(sessionRepository::delete);
    }

    public void invalidateAllUserSessions(UUID userId) {
        sessionRepository.deleteByUserId(userId);
    }

    public void invalidateOtherSessions(UUID userId, UUID currentSessionId) {
        sessionRepository.deleteOtherUserSessions(userId, currentSessionId);
    }

    public void extendSession(UUID sessionId, int additionalHours) {
        Optional<UserSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            session.setExpiresAt(session.getExpiresAt().plusHours(additionalHours));
            session.setLastAccessed(LocalDateTime.now());
            sessionRepository.save(session);
        }
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredSessions() {
        sessionRepository.deleteExpiredSessions(LocalDateTime.now());
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    @Transactional(readOnly = true)
    public long getActiveSessionCount(UUID userId) {
        return sessionRepository.countActiveSessionsByUserId(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<UserSession> getUserSessions(UUID userId) {
        return sessionRepository.findByUserId(userId);
    }
}
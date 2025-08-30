package com.company.auth.authservice.service;

import com.company.auth.authservice.entity.User;
import com.company.auth.authservice.entity.UserSession;
import com.company.auth.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthenticationService {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final UserService userService;
    private final UserSessionService userSessionService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthenticationService(
            AuthenticationConfiguration authenticationConfiguration,
            UserService userService,
            UserSessionService userSessionService,
            JwtUtil jwtUtil) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.userService = userService;
        this.userSessionService = userSessionService;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> authenticate(String identifier, String password, String ipAddress, String userAgent) {
        try {
            org.springframework.security.authentication.AuthenticationManager authManagerInstance;
            try {
                authManagerInstance = authenticationConfiguration.getAuthenticationManager();
            } catch (Exception e) {
                throw new BadCredentialsException("Authentication manager not available", e);
            }
            Authentication authentication = authManagerInstance.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, password)
            );

            User user = (User) authentication.getPrincipal();
            
            if (!user.isEnabled()) {
                throw new BadCredentialsException("User account is disabled, locked, or not verified");
            }

            userService.handleSuccessfulLogin(user.getId());

            List<String> authorities = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            UserSession session = userSessionService.createSession(user.getId(), ipAddress, userAgent);

            String accessToken = jwtUtil.generateAccessToken(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    authorities,
                    session.getId().toString(),
                    ipAddress
            );

            String refreshToken = jwtUtil.generateRefreshToken(user.getId(), session.getId().toString());

            userSessionService.updateSessionTokens(session.getId(), session.getSessionToken(), refreshToken);

            return Map.of(
                    "accessToken", accessToken,
                    "refreshToken", refreshToken,
                    "tokenType", "Bearer",
                    "expiresIn", jwtUtil.getRemainingExpirationTime(accessToken),
                    "user", Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "fullName", user.getFullName(),
                            "isVerified", user.getIsVerified()
                    )
            );

        } catch (AuthenticationException e) {
            User user = userService.findByUsernameOrEmail(identifier).orElse(null);
            if (user != null) {
                userService.handleFailedLogin(user.getId());
            }
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    public Map<String, Object> refreshToken(String refreshToken, String ipAddress) {
        if (!jwtUtil.canTokenBeRefreshed(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
        String sessionId = jwtUtil.getSessionIdFromToken(refreshToken);

        User user = userService.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isEnabled()) {
            throw new BadCredentialsException("User account is disabled, locked, or not verified");
        }

        UserSession session = userSessionService.findBySessionId(UUID.fromString(sessionId))
                .orElseThrow(() -> new BadCredentialsException("Session not found"));

        if (!userSessionService.isSessionValid(session)) {
            throw new BadCredentialsException("Session expired or invalid");
        }

        List<String> authorities = List.of("ROLE_USER");

        String newAccessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                authorities,
                sessionId,
                ipAddress
        );

        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId(), sessionId);

        userSessionService.updateSessionTokens(session.getId(), session.getSessionToken(), newRefreshToken);

        return Map.of(
                "accessToken", newAccessToken,
                "refreshToken", newRefreshToken,
                "tokenType", "Bearer",
                "expiresIn", jwtUtil.getRemainingExpirationTime(newAccessToken)
        );
    }

    public void logout(String sessionToken) {
        userSessionService.invalidateSession(sessionToken);
    }

    public void logoutAll(UUID userId) {
        userSessionService.invalidateAllUserSessions(userId);
    }

    public User register(String username, String email, String password, String firstName, String lastName) {
        return userService.createUser(username, email, password, firstName, lastName);
    }

    public boolean validateToken(String token) {
        try {
            jwtUtil.validateToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> getUserFromToken(String token) {
        if (!validateToken(token)) {
            throw new BadCredentialsException("Invalid token");
        }

        UUID userId = jwtUtil.getUserIdFromToken(token);
        User user = userService.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "isActive", user.getIsActive(),
                "isVerified", user.getIsVerified(),
                "lastLogin", user.getLastLogin()
        );
    }
}

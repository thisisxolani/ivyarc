package com.company.auth.authservice.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiration-ms:900000}")
    private long jwtAccessExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms:86400000}")
    private long jwtRefreshExpirationMs;

    @Value("${app.jwt.issuer:auth-service}")
    private String jwtIssuer;

    private SecretKey getSigningKey() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret key is not configured. Please set the 'app.jwt.secret' property.");
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT secret key must be at least 256 bits (32 characters) long for HS256 algorithm.");
        }
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UUID userId, String username, String email, List<String> authorities, String sessionId, String ipAddress) {
        Instant now = Instant.now();
        Instant expiration = now.plus(jwtAccessExpirationMs, ChronoUnit.MILLIS);

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(jwtIssuer)
                .audience().add("api-gateway").add("user-service").and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .claim("username", username)
                .claim("email", email)
                .claim("authorities", authorities)
                .claim("session_id", sessionId)
                .claim("ip", ipAddress)
                .claim("token_type", "access")
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(UUID userId, String sessionId) {
        Instant now = Instant.now();
        Instant expiration = now.plus(jwtRefreshExpirationMs, ChronoUnit.MILLIS);

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(jwtIssuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .claim("session_id", sessionId)
                .claim("token_type", "refresh")
                .signWith(getSigningKey())
                .compact();
    }

    public String generatePasswordResetToken(UUID userId, String email) {
        Instant now = Instant.now();
        Instant expiration = now.plus(3600000, ChronoUnit.MILLIS); // 1 hour

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(jwtIssuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .claim("email", email)
                .claim("token_type", "password_reset")
                .signWith(getSigningKey())
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new JwtException("Token has expired", e);
        } catch (UnsupportedJwtException e) {
            throw new JwtException("Token is not supported", e);
        } catch (MalformedJwtException e) {
            throw new JwtException("Token is malformed", e);
        } catch (SecurityException e) {
            throw new JwtException("Token signature is invalid", e);
        } catch (IllegalArgumentException e) {
            throw new JwtException("Token is null or empty", e);
        }
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        return UUID.fromString(claims.getSubject());
    }

    public String getUsernameFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("username", String.class);
    }

    public String getEmailFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("email", String.class);
    }

    public String getSessionIdFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("session_id", String.class);
    }

    public String getTokenType(String token) {
        Claims claims = validateToken(token);
        return claims.get("token_type", String.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> getAuthoritiesFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("authorities", List.class);
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = validateToken(token);
            return claims.getExpiration().before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    public boolean isValidTokenType(String token, String expectedType) {
        try {
            String tokenType = getTokenType(token);
            return expectedType.equals(tokenType);
        } catch (JwtException e) {
            return false;
        }
    }

    public Date getExpirationFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.getExpiration();
    }

    public Date getIssuedAtFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.getIssuedAt();
    }

    public long getRemainingExpirationTime(String token) {
        Date expiration = getExpirationFromToken(token);
        return expiration.getTime() - System.currentTimeMillis();
    }

    public boolean canTokenBeRefreshed(String token) {
        try {
            return !isTokenExpired(token) && isValidTokenType(token, "refresh");
        } catch (JwtException e) {
            return false;
        }
    }
}
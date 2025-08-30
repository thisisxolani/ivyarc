package com.company.auth.authservice.controller;

import com.company.auth.authservice.dto.*;
import com.company.auth.authservice.entity.User;
import com.company.auth.authservice.service.AuthenticationService;
import com.company.auth.authservice.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "User authentication and authorization operations")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthenticationService authenticationService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(AuthenticationService authenticationService, JwtUtil jwtUtil) {
        this.authenticationService = authenticationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return access/refresh tokens")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid credentials"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication failed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "423", description = "Account locked")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        
        try {
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            
            Map<String, Object> authResponse = authenticationService.authenticate(
                    loginRequest.getIdentifier(),
                    loginRequest.getPassword(),
                    ipAddress,
                    userAgent
            );
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(authResponse, "Login successful");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error(e.getMessage());
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error("Authentication failed");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Create a new user account")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Username or email already exists")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request) {
        
        try {
            User user = authenticationService.register(
                    registerRequest.getUsername(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getFirstName(),
                    registerRequest.getLastName()
            );
            
            Map<String, Object> userData = Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "isVerified", user.getIsVerified(),
                    "createdAt", user.getCreatedAt()
            );
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                    userData, 
                    "User registered successfully. Please verify your email address."
            );
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error(e.getMessage());
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error("Registration failed");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Get a new access token using refresh token")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid refresh token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Refresh token expired or invalid")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> refresh(
            @Valid @RequestBody RefreshTokenRequest refreshRequest,
            HttpServletRequest request) {
        
        try {
            String ipAddress = getClientIpAddress(request);
            
            Map<String, Object> authResponse = authenticationService.refreshToken(
                    refreshRequest.getRefreshToken(),
                    ipAddress
            );
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(authResponse, "Token refreshed successfully");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error(e.getMessage());
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error("Token refresh failed");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Invalidate user session")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid session"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired token")
    })
    public ResponseEntity<ApiResponse<String>> logout(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest request) {
        
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token == null) {
                throw new BadCredentialsException("Invalid authorization header");
            }
            
            // Validate the token first
            if (!authenticationService.validateToken(token)) {
                throw new BadCredentialsException("Invalid or expired token");
            }
            
            // Extract session ID from JWT token
            String sessionId = jwtUtil.getSessionIdFromToken(token);
            UUID userId = jwtUtil.getUserIdFromToken(token);
            String clientIp = getClientIpAddress(request);
            
            // Log security event
            logger.info("User logout initiated - UserID: {}, SessionID: {}, IP: {}", 
                       userId, sessionId, clientIp);
            
            // Invalidate the specific session
            authenticationService.logout(sessionId);
            
            // Log successful logout
            logger.info("User logout completed successfully - UserID: {}, SessionID: {}", 
                       userId, sessionId);
            
            ApiResponse<String> response = ApiResponse.success(null, "Logout successful");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            logger.warn("Logout attempt with invalid credentials from IP: {}", 
                       getClientIpAddress(request));
            
            ApiResponse<String> response = ApiResponse.error(e.getMessage());
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error during logout from IP: {}", 
                        getClientIpAddress(request), e);
            
            ApiResponse<String> response = ApiResponse.error("Logout failed");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Logout from all devices", description = "Invalidate all user sessions")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All sessions invalidated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired token")
    })
    public ResponseEntity<ApiResponse<String>> logoutAll(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest request) {
        
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token == null) {
                throw new BadCredentialsException("Invalid authorization header");
            }
            
            // Validate the token first
            if (!authenticationService.validateToken(token)) {
                throw new BadCredentialsException("Invalid or expired token");
            }
            
            UUID userId = jwtUtil.getUserIdFromToken(token);
            String clientIp = getClientIpAddress(request);
            
            // Log security event
            logger.info("User logout-all initiated - UserID: {}, IP: {}", userId, clientIp);
            
            // Invalidate all user sessions
            authenticationService.logoutAll(userId);
            
            // Log successful logout-all
            logger.info("User logout-all completed successfully - UserID: {}", userId);
            
            ApiResponse<String> response = ApiResponse.success(null, "All sessions have been invalidated");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            logger.warn("Logout-all attempt with invalid credentials from IP: {}", 
                       getClientIpAddress(request));
            
            ApiResponse<String> response = ApiResponse.error(e.getMessage());
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error during logout-all from IP: {}", 
                        getClientIpAddress(request), e);
            
            ApiResponse<String> response = ApiResponse.error("Logout-all failed");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user information")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User information retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired token")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest request) {
        
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token == null) {
                throw new BadCredentialsException("Invalid authorization header");
            }
            
            Map<String, Object> userInfo = authenticationService.getUserFromToken(token);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(userInfo, "User information retrieved");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error(e.getMessage());
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            ApiResponse<Map<String, Object>> response = ApiResponse.error("Failed to retrieve user information");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate token", description = "Validate JWT access token")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token is valid"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Token is invalid or expired")
    })
    public ResponseEntity<ApiResponse<Boolean>> validateToken(
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest request) {
        
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token == null) {
                throw new BadCredentialsException("Invalid authorization header");
            }
            
            boolean isValid = authenticationService.validateToken(token);
            
            ApiResponse<Boolean> response = ApiResponse.success(isValid, 
                    isValid ? "Token is valid" : "Token is invalid");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ApiResponse<Boolean> response = ApiResponse.success(false, "Token validation failed");
            response.setPath(request.getRequestURI());
            
            return ResponseEntity.ok(response);
        }
    }

    private String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
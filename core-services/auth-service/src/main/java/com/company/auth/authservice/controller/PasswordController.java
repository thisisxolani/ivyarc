package com.company.auth.authservice.controller;

import com.company.auth.authservice.dto.*;
import com.company.auth.authservice.service.PasswordResetService;
import com.company.auth.authservice.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Password Management", description = "Password reset and change operations")
public class PasswordController {

    private final PasswordResetService passwordResetService;
    private final JwtUtil jwtUtil;

    @Autowired
    public PasswordController(PasswordResetService passwordResetService, JwtUtil jwtUtil) {
        this.passwordResetService = passwordResetService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Send password reset email to user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset email sent (if email exists)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid email format"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Too many requests")
    })
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            passwordResetService.requestPasswordReset(request.getEmail());
            
            ApiResponse<String> response = ApiResponse.success(
                    null, 
                    "If the email address exists in our system, you will receive password reset instructions."
            );
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            ApiResponse<String> response = ApiResponse.error(e.getMessage());
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.error("Failed to process password reset request");
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using reset token")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Invalid password format")
    })
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            
            ApiResponse<String> response = ApiResponse.success(
                    null, 
                    "Password has been reset successfully. You can now log in with your new password."
            );
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            ApiResponse<String> response = ApiResponse.error(e.getMessage());
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.error("Failed to reset password");
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/validate-reset-token")
    @Operation(summary = "Validate reset token", description = "Check if password reset token is valid")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token validation result"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Missing token parameter")
    })
    public ResponseEntity<ApiResponse<Boolean>> validateResetToken(
            @RequestParam("token") String token,
            HttpServletRequest httpRequest) {
        
        try {
            boolean isValid = passwordResetService.validateResetToken(token);
            
            ApiResponse<Boolean> response = ApiResponse.success(
                    isValid, 
                    isValid ? "Token is valid" : "Token is invalid or expired"
            );
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ApiResponse<Boolean> response = ApiResponse.success(false, "Token validation failed");
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Change password", description = "Change password for authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid current password or password format"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader,
            HttpServletRequest httpRequest) {
        
        try {
            String token = extractTokenFromHeader(authHeader);
            if (token == null) {
                throw new BadCredentialsException("Invalid authorization header");
            }
            
            UUID userId = jwtUtil.getUserIdFromToken(token);
            
            passwordResetService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
            
            ApiResponse<String> response = ApiResponse.success(
                    null, 
                    "Password changed successfully"
            );
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            ApiResponse<String> response = ApiResponse.error("Invalid authorization token");
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<String> response = ApiResponse.error(e.getMessage());
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.error("Failed to change password");
            response.setPath(httpRequest.getRequestURI());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
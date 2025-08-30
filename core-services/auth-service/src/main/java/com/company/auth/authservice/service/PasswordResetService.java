package com.company.auth.authservice.service;

import com.company.auth.authservice.entity.PasswordResetToken;
import com.company.auth.authservice.entity.User;
import com.company.auth.authservice.repository.PasswordResetTokenRepository;
import com.company.auth.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserService userService;
    private final UserSessionService userSessionService;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.password-reset.token-expiration-minutes:60}")
    private int tokenExpirationMinutes;

    @Value("${app.password-reset.max-requests-per-hour:3}")
    private int maxRequestsPerHour;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${spring.mail.username:noreply@company.com}")
    private String fromEmail;

    @Autowired
    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserService userService,
            UserSessionService userSessionService,
            JwtUtil jwtUtil,
            JavaMailSender mailSender) {
        this.tokenRepository = tokenRepository;
        this.userService = userService;
        this.userSessionService = userSessionService;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
    }

    public void requestPasswordReset(String email) {
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not for security reasons
            return;
        }

        User user = userOpt.get();

        // Check rate limiting
        long recentRequests = tokenRepository.countRecentTokensByUserId(
                user.getId(), 
                LocalDateTime.now().minusHours(1)
        );

        if (recentRequests >= maxRequestsPerHour) {
            throw new IllegalStateException("Too many password reset requests. Please try again later.");
        }

        // Invalidate existing tokens for this user
        tokenRepository.deleteByUserId(user.getId());

        // Generate secure token
        String token = generateSecureToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(tokenExpirationMinutes);

        PasswordResetToken resetToken = new PasswordResetToken(user, token, expiresAt);
        tokenRepository.save(resetToken);

        // Send reset email asynchronously
        sendPasswordResetEmail(user, token);
    }

    @Transactional(readOnly = true)
    public boolean validateResetToken(String token) {
        return tokenRepository.findValidToken(token, LocalDateTime.now()).isPresent();
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findValidToken(token, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        User user = resetToken.getUser();

        // Reset the password
        userService.resetPassword(user.getId(), newPassword);

        // Mark token as used
        tokenRepository.markTokenAsUsed(token, LocalDateTime.now());

        // Invalidate all user sessions for security
        // This ensures that if the password was compromised, existing sessions are terminated
        userSessionService.invalidateAllUserSessions(user.getId());

        // Send confirmation email
        sendPasswordResetConfirmationEmail(user);
    }

    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        userService.changePassword(userId, currentPassword, newPassword);
        
        // Optionally invalidate all sessions except current one for additional security
        // For now, we'll invalidate all sessions when password is changed
        userSessionService.invalidateAllUserSessions(userId);
        
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        sendPasswordChangeNotificationEmail(user);
    }

    @Async
    protected void sendPasswordResetEmail(User user, String token) {
        try {
            String resetUrl = baseUrl + "/reset-password?token=" + token;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Password Reset Request");
            message.setText(buildPasswordResetEmailText(user, resetUrl, tokenExpirationMinutes));
            
            mailSender.send(message);
        } catch (Exception e) {
            // Log the error but don't throw to avoid transaction rollback
            // In production, you might want to use a message queue for reliability
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }
    }

    @Async
    protected void sendPasswordResetConfirmationEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Password Reset Successful");
            message.setText(buildPasswordResetConfirmationEmailText(user));
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset confirmation email: " + e.getMessage());
        }
    }

    @Async
    protected void sendPasswordChangeNotificationEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Password Changed");
            message.setText(buildPasswordChangeNotificationEmailText(user));
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password change notification email: " + e.getMessage());
        }
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredAndUsedTokens(LocalDateTime.now());
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String buildPasswordResetEmailText(User user, String resetUrl, int expirationMinutes) {
        return String.format("""
                Hello %s,
                
                You have requested to reset your password. Please click the link below to reset your password:
                
                %s
                
                This link will expire in %d minutes.
                
                If you did not request this password reset, please ignore this email.
                
                Best regards,
                The Security Team
                """, 
                user.getFullName(), 
                resetUrl, 
                expirationMinutes
        );
    }

    private String buildPasswordResetConfirmationEmailText(User user) {
        return String.format("""
                Hello %s,
                
                Your password has been successfully reset.
                
                If you did not perform this action, please contact our support team immediately.
                
                Best regards,
                The Security Team
                """, 
                user.getFullName()
        );
    }

    private String buildPasswordChangeNotificationEmailText(User user) {
        return String.format("""
                Hello %s,
                
                Your password has been successfully changed.
                
                If you did not perform this action, please contact our support team immediately.
                
                Best regards,
                The Security Team
                """, 
                user.getFullName()
        );
    }
}
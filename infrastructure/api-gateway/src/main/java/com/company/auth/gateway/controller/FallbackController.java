package com.company.auth.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> authServiceFallback() {
        Map<String, Object> response = Map.of(
            "error", "SERVICE_UNAVAILABLE",
            "message", "Authentication service is temporarily unavailable. Please try again later.",
            "timestamp", Instant.now().toString(),
            "service", "auth-service"
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        Map<String, Object> response = Map.of(
            "error", "SERVICE_UNAVAILABLE",
            "message", "User service is temporarily unavailable. Please try again later.",
            "timestamp", Instant.now().toString(),
            "service", "user-service"
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/authorization")
    public ResponseEntity<Map<String, Object>> authorizationServiceFallback() {
        Map<String, Object> response = Map.of(
            "error", "SERVICE_UNAVAILABLE",
            "message", "Authorization service is temporarily unavailable. Please try again later.",
            "timestamp", Instant.now().toString(),
            "service", "authorization-service"
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/audit")
    public ResponseEntity<Map<String, Object>> auditServiceFallback() {
        Map<String, Object> response = Map.of(
            "error", "SERVICE_UNAVAILABLE",
            "message", "Audit service is temporarily unavailable. Please try again later.",
            "timestamp", Instant.now().toString(),
            "service", "audit-service"
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/generic")
    public ResponseEntity<Map<String, Object>> genericFallback() {
        Map<String, Object> response = Map.of(
            "error", "SERVICE_UNAVAILABLE",
            "message", "The requested service is temporarily unavailable. Please try again later.",
            "timestamp", Instant.now().toString(),
            "service", "unknown"
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
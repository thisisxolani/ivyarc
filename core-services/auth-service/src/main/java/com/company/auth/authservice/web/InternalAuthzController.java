package com.company.auth.authservice.web;

import com.company.auth.authservice.client.AuthorizationClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/internal/authz")
public class InternalAuthzController {
    private final AuthorizationClient authorizationClient;

    public InternalAuthzController(AuthorizationClient authorizationClient) {
        this.authorizationClient = authorizationClient;
    }

    @GetMapping("/roles")
    public ResponseEntity<Map<String, Object>> roles(@RequestHeader(value = "Authorization", required = false) String bearer) {
        return ResponseEntity.ok(authorizationClient.getCurrentRoles(bearer));
    }
}


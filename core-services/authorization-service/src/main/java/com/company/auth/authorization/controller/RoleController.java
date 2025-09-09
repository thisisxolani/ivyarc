package com.company.auth.authorization.controller;

import com.company.auth.authorization.repository.UserRoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final UserRoleRepository userRoleRepository;

    public RoleController(UserRoleRepository userRoleRepository) {
        this.userRoleRepository = userRoleRepository;
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentRoles(
            @RequestHeader(name = "X-User", required = false) String usernameHeader,
            @RequestHeader(name = "Authorization", required = false) String bearer
    ) {
        // For now prefer X-User header; fallback to "admin" if not provided
        String username = (usernameHeader == null || usernameHeader.isBlank()) ? "admin" : usernameHeader;
        var roles = userRoleRepository.findByUsernameWithRole(username)
                .stream()
                .map(ur -> ur.getRole().getName())
                .distinct()
                .toList();
        return ResponseEntity.ok(Map.of(
                "user", username,
                "roles", roles
        ));
    }
}

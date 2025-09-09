package com.company.user.usermanagement.controller;

import com.company.user.usermanagement.dto.UserProfileDto;
import com.company.user.usermanagement.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Profile Management", description = "APIs for managing user profiles")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @PostMapping
    @Operation(summary = "Create a new user profile")
    public ResponseEntity<Object> createUserProfile(@Valid @RequestBody UserProfileDto userProfileDto) {
        try {
            UserProfileDto createdProfile = userProfileService.createUserProfile(userProfileDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<Object> getUserProfile(@PathVariable Long id) {
        return userProfileService.getUserProfileById(id)
                .map(profile -> ResponseEntity.ok().body((Object) profile))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User profile not found with id: " + id)));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user profile by user ID")
    public ResponseEntity<Object> getUserProfileByUserId(@PathVariable String userId) {
        return userProfileService.getUserProfileByUserId(userId)
                .map(profile -> ResponseEntity.ok().body((Object) profile))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User profile not found with userId: " + userId)));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get user profile by email")
    public ResponseEntity<Object> getUserProfileByEmail(@PathVariable String email) {
        return userProfileService.getUserProfileByEmail(email)
                .map(profile -> ResponseEntity.ok().body((Object) profile))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User profile not found with email: " + email)));
    }

    @GetMapping
    @Operation(summary = "Get all user profiles with pagination")
    public ResponseEntity<Page<UserProfileDto>> getAllUserProfiles(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean active,
            @Parameter(description = "Search term") @RequestParam(required = false) String search) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<UserProfileDto> profiles;
        
        if (search != null && !search.trim().isEmpty()) {
            if (active != null && active) {
                profiles = userProfileService.searchActiveUserProfiles(search.trim(), pageable);
            } else {
                profiles = userProfileService.searchUserProfiles(search.trim(), pageable);
            }
        } else if (active != null && active) {
            profiles = userProfileService.getActiveUserProfiles(pageable);
        } else {
            profiles = userProfileService.getAllUserProfiles(pageable);
        }

        return ResponseEntity.ok(profiles);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile by ID")
    public ResponseEntity<Object> updateUserProfile(@PathVariable Long id, @Valid @RequestBody UserProfileDto userProfileDto) {
        try {
            UserProfileDto updatedProfile = userProfileService.updateUserProfile(id, userProfileDto);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/user/{userId}")
    @Operation(summary = "Update user profile by user ID")
    public ResponseEntity<Object> updateUserProfileByUserId(@PathVariable String userId, @Valid @RequestBody UserProfileDto userProfileDto) {
        try {
            UserProfileDto updatedProfile = userProfileService.updateUserProfileByUserId(userId, userProfileDto);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user profile by ID")
    public ResponseEntity<Map<String, String>> deleteUserProfile(@PathVariable Long id) {
        try {
            userProfileService.deleteUserProfile(id);
            return ResponseEntity.ok(Map.of("message", "User profile deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate user profile")
    public ResponseEntity<Map<String, String>> deactivateUserProfile(@PathVariable Long id) {
        try {
            userProfileService.deactivateUserProfile(id);
            return ResponseEntity.ok(Map.of("message", "User profile deactivated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate user profile")
    public ResponseEntity<Map<String, String>> activateUserProfile(@PathVariable Long id) {
        try {
            userProfileService.activateUserProfile(id);
            return ResponseEntity.ok(Map.of("message", "User profile activated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        long activeUsers = userProfileService.getActiveUserCount();
        long inactiveUsers = userProfileService.getInactiveUserCount();
        long totalUsers = activeUsers + inactiveUsers;

        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "activeUsers", activeUsers,
                "inactiveUsers", inactiveUsers,
                "activePercentage", totalUsers > 0 ? (double) activeUsers / totalUsers * 100 : 0
        );

        return ResponseEntity.ok(stats);
    }
}
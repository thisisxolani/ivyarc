package com.company.auth.authservice.repository;

import com.company.auth.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.isVerified = true AND u.isLocked = false")
    Optional<User> findActiveUser(@Param("identifier") String identifier);

    @Query("SELECT u FROM User u WHERE (u.username = :identifier OR u.email = :identifier) AND u.isActive = true")
    Optional<User> findByUsernameOrEmailAndIsActiveTrue(@Param("identifier") String identifier);

    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") UUID userId, @Param("lastLogin") LocalDateTime lastLogin);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :userId")
    void incrementFailedLoginAttempts(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0 WHERE u.id = :userId")
    void resetFailedLoginAttempts(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE User u SET u.isLocked = true, u.lockedAt = :lockedAt WHERE u.id = :userId")
    void lockUser(@Param("userId") UUID userId, @Param("lockedAt") LocalDateTime lockedAt);

    @Modifying
    @Query("UPDATE User u SET u.isLocked = false, u.lockedAt = null, u.failedLoginAttempts = 0 WHERE u.id = :userId")
    void unlockUser(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE User u SET u.isVerified = true WHERE u.id = :userId")
    void verifyUser(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE User u SET u.passwordHash = :passwordHash, u.passwordChangedAt = :passwordChangedAt WHERE u.id = :userId")
    void updatePassword(@Param("userId") UUID userId, @Param("passwordHash") String passwordHash, 
                       @Param("passwordChangedAt") LocalDateTime passwordChangedAt);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.failedLoginAttempts >= :maxAttempts")
    boolean hasExceededLoginAttempts(@Param("maxAttempts") int maxAttempts);
}
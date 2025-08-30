package com.company.auth.authorization.repository;

import com.company.auth.authorization.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserRole entities
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    /**
     * Find user roles by user ID
     */
    List<UserRole> findByUserId(Long userId);

    /**
     * Find active user roles by user ID
     */
    List<UserRole> findByUserIdAndIsActiveTrue(Long userId);

    /**
     * Find active and non-expired user roles by user ID
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.userId = :userId " +
           "AND ur.isActive = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP)")
    List<UserRole> findValidUserRoles(@Param("userId") Long userId);

    /**
     * Find user role by user ID and role ID
     */
    Optional<UserRole> findByUserIdAndRoleId(Long userId, Long roleId);

    /**
     * Find user roles by role ID
     */
    List<UserRole> findByRoleId(Long roleId);

    /**
     * Find active user roles by role ID
     */
    List<UserRole> findByRoleIdAndIsActiveTrue(Long roleId);

    /**
     * Check if user has role
     */
    boolean existsByUserIdAndRoleId(Long userId, Long roleId);

    /**
     * Check if user has active role
     */
    @Query("SELECT COUNT(ur) > 0 FROM UserRole ur WHERE ur.userId = :userId AND ur.role.id = :roleId " +
           "AND ur.isActive = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP)")
    boolean hasActiveRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

    /**
     * Check if user has role by role name
     */
    @Query("SELECT COUNT(ur) > 0 FROM UserRole ur WHERE ur.userId = :userId AND ur.role.name = :roleName " +
           "AND ur.isActive = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP)")
    boolean hasRoleByName(@Param("userId") Long userId, @Param("roleName") String roleName);

    /**
     * Find user roles by role name
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.role.name = :roleName AND ur.isActive = true")
    List<UserRole> findByRoleName(@Param("roleName") String roleName);

    /**
     * Find expired user roles
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.expiresAt IS NOT NULL AND ur.expiresAt < CURRENT_TIMESTAMP")
    List<UserRole> findExpiredUserRoles();

    /**
     * Find user roles expiring soon
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.expiresAt IS NOT NULL AND ur.expiresAt < :expirationTime")
    List<UserRole> findUserRolesExpiringBefore(@Param("expirationTime") LocalDateTime expirationTime);

    /**
     * Find user roles with pagination
     */
    Page<UserRole> findByUserId(Long userId, Pageable pageable);

    /**
     * Find active user roles with pagination
     */
    Page<UserRole> findByUserIdAndIsActiveTrue(Long userId, Pageable pageable);

    /**
     * Count user roles by user ID
     */
    long countByUserId(Long userId);

    /**
     * Count active user roles by user ID
     */
    long countByUserIdAndIsActiveTrue(Long userId);

    /**
     * Count user roles by role ID
     */
    long countByRoleId(Long roleId);

    /**
     * Count active user roles by role ID
     */
    long countByRoleIdAndIsActiveTrue(Long roleId);

    /**
     * Deactivate user role
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.isActive = false WHERE ur.userId = :userId AND ur.role.id = :roleId")
    int deactivateUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

    /**
     * Deactivate all user roles for a user
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.isActive = false WHERE ur.userId = :userId")
    int deactivateAllUserRoles(@Param("userId") Long userId);

    /**
     * Deactivate expired user roles
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.isActive = false WHERE ur.expiresAt IS NOT NULL AND ur.expiresAt < CURRENT_TIMESTAMP AND ur.isActive = true")
    int deactivateExpiredUserRoles();

    /**
     * Delete user role
     */
    void deleteByUserIdAndRoleId(Long userId, Long roleId);

    /**
     * Delete all user roles for a user
     */
    void deleteByUserId(Long userId);

    /**
     * Find users with specific role
     */
    @Query("SELECT DISTINCT ur.userId FROM UserRole ur WHERE ur.role.name = :roleName " +
           "AND ur.isActive = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP)")
    List<Long> findUserIdsByRoleName(@Param("roleName") String roleName);

    /**
     * Find users with any of the specified role names
     */
    @Query("SELECT DISTINCT ur.userId FROM UserRole ur WHERE ur.role.name IN :roleNames " +
           "AND ur.isActive = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP)")
    List<Long> findUserIdsByRoleNames(@Param("roleNames") List<String> roleNames);

    /**
     * Find user roles created by specific user
     */
    List<UserRole> findByCreatedBy(Long createdBy);

    /**
     * Find recently created user roles
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.createdAt >= :since ORDER BY ur.createdAt DESC")
    List<UserRole> findRecentUserRoles(@Param("since") LocalDateTime since);
}
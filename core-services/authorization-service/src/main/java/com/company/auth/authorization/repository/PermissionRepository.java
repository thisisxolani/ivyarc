package com.company.auth.authorization.repository;

import com.company.auth.authorization.entity.Permission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository interface for Permission entities
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    /**
     * Find permission by name
     */
    Optional<Permission> findByName(String name);

    /**
     * Find permissions by names
     */
    List<Permission> findByNameIn(Set<String> names);

    /**
     * Find active permissions
     */
    List<Permission> findByIsActiveTrue();

    /**
     * Find active permissions with pagination
     */
    Page<Permission> findByIsActiveTrue(Pageable pageable);

    /**
     * Find permissions by active status
     */
    List<Permission> findByIsActive(Boolean isActive);

    /**
     * Find permissions by resource
     */
    List<Permission> findByResource(String resource);

    /**
     * Find permissions by resource and action
     */
    Optional<Permission> findByResourceAndAction(String resource, String action);

    /**
     * Find permissions by action
     */
    List<Permission> findByAction(String action);

    /**
     * Find system permissions
     */
    List<Permission> findByIsSystemTrue();

    /**
     * Find non-system permissions
     */
    List<Permission> findByIsSystemFalse();

    /**
     * Check if permission exists by name
     */
    boolean existsByName(String name);

    /**
     * Check if permission exists by resource and action
     */
    boolean existsByResourceAndAction(String resource, String action);

    /**
     * Find permissions by user ID through roles
     */
    @Query("SELECT DISTINCT p FROM Permission p " +
           "JOIN p.roles r " +
           "JOIN r.userRoles ur " +
           "WHERE ur.userId = :userId " +
           "AND ur.isActive = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP) " +
           "AND r.isActive = true " +
           "AND p.isActive = true")
    List<Permission> findPermissionsByUserId(@Param("userId") Long userId);

    /**
     * Find permissions by role ID
     */
    @Query("SELECT p FROM Permission p JOIN p.roles r WHERE r.id = :roleId AND p.isActive = true")
    List<Permission> findByRoleId(@Param("roleId") Long roleId);

    /**
     * Find permissions by role name
     */
    @Query("SELECT p FROM Permission p JOIN p.roles r WHERE r.name = :roleName AND r.isActive = true AND p.isActive = true")
    List<Permission> findByRoleName(@Param("roleName") String roleName);

    /**
     * Search permissions by name, resource, or description
     */
    @Query("SELECT p FROM Permission p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.resource) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.action) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Permission> searchPermissions(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find permissions that match resource pattern (wildcard support)
     */
    @Query("SELECT p FROM Permission p WHERE p.resource = :resource OR p.resource = '*'")
    List<Permission> findByResourceOrWildcard(@Param("resource") String resource);

    /**
     * Find permissions that match action pattern (wildcard support)
     */
    @Query("SELECT p FROM Permission p WHERE p.action = :action OR p.action = '*'")
    List<Permission> findByActionOrWildcard(@Param("action") String action);

    /**
     * Find permissions that match resource and action patterns
     */
    @Query("SELECT p FROM Permission p WHERE " +
           "(p.resource = :resource OR p.resource = '*') AND " +
           "(p.action = :action OR p.action = '*') AND " +
           "p.isActive = true")
    List<Permission> findMatchingPermissions(@Param("resource") String resource, @Param("action") String action);

    /**
     * Check if user has specific permission
     */
    @Query("SELECT COUNT(p) > 0 FROM Permission p " +
           "JOIN p.roles r " +
           "JOIN r.userRoles ur " +
           "WHERE ur.userId = :userId " +
           "AND ur.isActive = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP) " +
           "AND r.isActive = true " +
           "AND p.isActive = true " +
           "AND ((p.resource = :resource OR p.resource = '*') AND (p.action = :action OR p.action = '*'))")
    boolean hasUserPermission(@Param("userId") Long userId, @Param("resource") String resource, @Param("action") String action);

    /**
     * Count permissions by active status
     */
    long countByIsActive(Boolean isActive);

    /**
     * Count system permissions
     */
    long countByIsSystemTrue();

    /**
     * Find permissions without any roles assigned
     */
    @Query("SELECT p FROM Permission p LEFT JOIN p.roles r WHERE r IS NULL AND p.isActive = true")
    List<Permission> findPermissionsWithoutRoles();

    /**
     * Find all unique resources
     */
    @Query("SELECT DISTINCT p.resource FROM Permission p WHERE p.isActive = true ORDER BY p.resource")
    List<String> findAllResources();

    /**
     * Find all unique actions
     */
    @Query("SELECT DISTINCT p.action FROM Permission p WHERE p.isActive = true ORDER BY p.action")
    List<String> findAllActions();
}
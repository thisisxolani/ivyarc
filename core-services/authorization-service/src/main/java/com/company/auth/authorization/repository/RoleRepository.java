package com.company.auth.authorization.repository;

import com.company.auth.authorization.entity.Role;
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
 * Repository interface for Role entities
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find role by name
     */
    Optional<Role> findByName(String name);

    /**
     * Find roles by names
     */
    List<Role> findByNameIn(Set<String> names);

    /**
     * Find active roles
     */
    List<Role> findByIsActiveTrue();

    /**
     * Find active roles with pagination
     */
    Page<Role> findByIsActiveTrue(Pageable pageable);

    /**
     * Find roles by active status
     */
    List<Role> findByIsActive(Boolean isActive);

    /**
     * Find system roles
     */
    List<Role> findByIsSystemTrue();

    /**
     * Find non-system roles
     */
    List<Role> findByIsSystemFalse();

    /**
     * Check if role exists by name
     */
    boolean existsByName(String name);

    /**
     * Find roles with permissions
     */
    @Query("SELECT r FROM Role r JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<Role> findByIdWithPermissions(@Param("id") Long id);

    /**
     * Find roles by user ID
     */
    @Query("SELECT r FROM Role r JOIN r.userRoles ur WHERE ur.userId = :userId AND ur.isActive = true AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP)")
    List<Role> findActiveRolesByUserId(@Param("userId") Long userId);

    /**
     * Find roles by user ID with pagination
     */
    @Query("SELECT r FROM Role r JOIN r.userRoles ur WHERE ur.userId = :userId AND ur.isActive = true AND (ur.expiresAt IS NULL OR ur.expiresAt > CURRENT_TIMESTAMP)")
    Page<Role> findActiveRolesByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find roles by permission
     */
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.id = :permissionId AND r.isActive = true")
    List<Role> findByPermissionId(@Param("permissionId") Long permissionId);

    /**
     * Search roles by name containing (case insensitive)
     */
    @Query("SELECT r FROM Role r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Role> searchRoles(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Count roles by active status
     */
    long countByIsActive(Boolean isActive);

    /**
     * Count system roles
     */
    long countByIsSystemTrue();

    /**
     * Find roles that have specific permission
     */
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.name = :permissionName AND r.isActive = true")
    List<Role> findByPermissionName(@Param("permissionName") String permissionName);

    /**
     * Find roles with at least one permission
     */
    @Query("SELECT DISTINCT r FROM Role r JOIN r.permissions p WHERE r.isActive = true")
    List<Role> findRolesWithPermissions();

    /**
     * Find roles without any permissions
     */
    @Query("SELECT r FROM Role r LEFT JOIN r.permissions p WHERE p IS NULL AND r.isActive = true")
    List<Role> findRolesWithoutPermissions();
}
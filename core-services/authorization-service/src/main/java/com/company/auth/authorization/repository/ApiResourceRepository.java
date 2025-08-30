package com.company.auth.authorization.repository;

import com.company.auth.authorization.entity.ApiResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ApiResource entities
 */
@Repository
public interface ApiResourceRepository extends JpaRepository<ApiResource, Long> {

    /**
     * Find API resources by service name
     */
    List<ApiResource> findByServiceName(String serviceName);

    /**
     * Find active API resources by service name
     */
    List<ApiResource> findByServiceNameAndIsActiveTrue(String serviceName);

    /**
     * Find API resource by service name, endpoint pattern, and HTTP method
     */
    Optional<ApiResource> findByServiceNameAndEndpointPatternAndHttpMethod(
        String serviceName, String endpointPattern, String httpMethod);

    /**
     * Find API resources by HTTP method
     */
    List<ApiResource> findByHttpMethod(String httpMethod);

    /**
     * Find active API resources
     */
    List<ApiResource> findByIsActiveTrue();

    /**
     * Find active API resources with pagination
     */
    Page<ApiResource> findByIsActiveTrue(Pageable pageable);

    /**
     * Find API resources by active status
     */
    List<ApiResource> findByIsActive(Boolean isActive);

    /**
     * Find API resources by permission ID
     */
    List<ApiResource> findByPermissionId(Long permissionId);

    /**
     * Find API resources ordered by priority
     */
    @Query("SELECT ar FROM ApiResource ar WHERE ar.isActive = true ORDER BY ar.priority DESC, ar.serviceName ASC")
    List<ApiResource> findAllOrderedByPriority();

    /**
     * Find API resources for endpoint matching
     * This is used for authorization checking
     */
    @Query("SELECT ar FROM ApiResource ar WHERE ar.serviceName = :serviceName " +
           "AND ar.httpMethod = :httpMethod " +
           "AND ar.isActive = true " +
           "ORDER BY ar.priority DESC")
    List<ApiResource> findMatchingResources(@Param("serviceName") String serviceName, 
                                          @Param("httpMethod") String httpMethod);

    /**
     * Find API resources that could match any service (wildcard support)
     */
    @Query("SELECT ar FROM ApiResource ar WHERE (ar.serviceName = :serviceName OR ar.serviceName = '*') " +
           "AND ar.httpMethod = :httpMethod " +
           "AND ar.isActive = true " +
           "ORDER BY ar.priority DESC")
    List<ApiResource> findMatchingResourcesWithWildcard(@Param("serviceName") String serviceName, 
                                                       @Param("httpMethod") String httpMethod);

    /**
     * Search API resources by description or endpoint pattern
     */
    @Query("SELECT ar FROM ApiResource ar WHERE " +
           "LOWER(ar.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(ar.endpointPattern) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(ar.serviceName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<ApiResource> searchApiResources(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Check if API resource exists
     */
    boolean existsByServiceNameAndEndpointPatternAndHttpMethod(
        String serviceName, String endpointPattern, String httpMethod);

    /**
     * Count API resources by service name
     */
    long countByServiceName(String serviceName);

    /**
     * Count active API resources by service name
     */
    long countByServiceNameAndIsActiveTrue(String serviceName);

    /**
     * Count API resources by HTTP method
     */
    long countByHttpMethod(String httpMethod);

    /**
     * Count API resources by permission
     */
    long countByPermissionId(Long permissionId);

    /**
     * Find all unique service names
     */
    @Query("SELECT DISTINCT ar.serviceName FROM ApiResource ar WHERE ar.isActive = true ORDER BY ar.serviceName")
    List<String> findAllServiceNames();

    /**
     * Find all unique HTTP methods
     */
    @Query("SELECT DISTINCT ar.httpMethod FROM ApiResource ar WHERE ar.isActive = true ORDER BY ar.httpMethod")
    List<String> findAllHttpMethods();

    /**
     * Find API resources by permission name
     */
    @Query("SELECT ar FROM ApiResource ar WHERE ar.permission.name = :permissionName AND ar.isActive = true")
    List<ApiResource> findByPermissionName(@Param("permissionName") String permissionName);

    /**
     * Find API resources with specific permission resource and action
     */
    @Query("SELECT ar FROM ApiResource ar WHERE ar.permission.resource = :resource " +
           "AND ar.permission.action = :action AND ar.isActive = true")
    List<ApiResource> findByPermissionResourceAndAction(@Param("resource") String resource, 
                                                       @Param("action") String action);

    /**
     * Find API resources with high priority (above threshold)
     */
    @Query("SELECT ar FROM ApiResource ar WHERE ar.priority >= :minPriority AND ar.isActive = true ORDER BY ar.priority DESC")
    List<ApiResource> findHighPriorityResources(@Param("minPriority") Integer minPriority);

    /**
     * Find API resources without description
     */
    @Query("SELECT ar FROM ApiResource ar WHERE (ar.description IS NULL OR ar.description = '') AND ar.isActive = true")
    List<ApiResource> findResourcesWithoutDescription();

    /**
     * Find endpoint patterns that might conflict (same service and method)
     */
    @Query("SELECT ar1 FROM ApiResource ar1, ApiResource ar2 WHERE ar1.id != ar2.id " +
           "AND ar1.serviceName = ar2.serviceName " +
           "AND ar1.httpMethod = ar2.httpMethod " +
           "AND ar1.isActive = true AND ar2.isActive = true " +
           "AND ar1.endpointPattern = ar2.endpointPattern")
    List<ApiResource> findPotentialConflicts();

    /**
     * Get API resources with permission details for caching
     */
    @Query("SELECT ar FROM ApiResource ar JOIN FETCH ar.permission WHERE ar.isActive = true")
    List<ApiResource> findAllWithPermissions();

    /**
     * Get API resources for a service with permission details
     */
    @Query("SELECT ar FROM ApiResource ar JOIN FETCH ar.permission WHERE ar.serviceName = :serviceName AND ar.isActive = true")
    List<ApiResource> findByServiceNameWithPermissions(@Param("serviceName") String serviceName);
}
package com.company.auth.authorization.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * ApiResource entity representing API endpoints and their required permissions
 */
@Entity
@Table(name = "api_resources", indexes = {
    @Index(name = "idx_api_resources_service_endpoint", columnList = "service_name, endpoint_pattern", unique = true),
    @Index(name = "idx_api_resources_service", columnList = "service_name"),
    @Index(name = "idx_api_resources_active", columnList = "is_active")
})
@EntityListeners(AuditingEntityListener.class)
public class ApiResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Service name is required")
    @Size(max = 50, message = "Service name must not exceed 50 characters")
    @Column(name = "service_name", nullable = false, length = 50)
    private String serviceName;

    @NotBlank(message = "Endpoint pattern is required")
    @Size(max = 200, message = "Endpoint pattern must not exceed 200 characters")
    @Column(name = "endpoint_pattern", nullable = false, length = 200)
    private String endpointPattern;

    @NotBlank(message = "HTTP method is required")
    @Size(max = 10, message = "HTTP method must not exceed 10 characters")
    @Column(name = "http_method", nullable = false, length = 10)
    private String httpMethod;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "required_permission_id", nullable = false)
    private Permission permission;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "priority", nullable = false)
    private Integer priority = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ApiResource() {}

    public ApiResource(String serviceName, String endpointPattern, String httpMethod, Permission permission) {
        this.serviceName = serviceName;
        this.endpointPattern = endpointPattern;
        this.httpMethod = httpMethod;
        this.permission = permission;
    }

    public ApiResource(String serviceName, String endpointPattern, String httpMethod, 
                      Permission permission, String description) {
        this.serviceName = serviceName;
        this.endpointPattern = endpointPattern;
        this.httpMethod = httpMethod;
        this.permission = permission;
        this.description = description;
    }

    public ApiResource(String serviceName, String endpointPattern, String httpMethod, 
                      Permission permission, String description, Integer priority) {
        this.serviceName = serviceName;
        this.endpointPattern = endpointPattern;
        this.httpMethod = httpMethod;
        this.permission = permission;
        this.description = description;
        this.priority = priority;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getEndpointPattern() {
        return endpointPattern;
    }

    public void setEndpointPattern(String endpointPattern) {
        this.endpointPattern = endpointPattern;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public Permission getPermission() {
        return permission;
    }

    public void setPermission(Permission permission) {
        this.permission = permission;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Utility methods
    public boolean matchesEndpoint(String endpoint, String method) {
        if (!httpMethod.equalsIgnoreCase(method)) {
            return false;
        }
        return matchesPattern(endpointPattern, endpoint);
    }

    private boolean matchesPattern(String pattern, String endpoint) {
        // Convert Ant pattern to regex
        String regexPattern = pattern
                .replace("**", ".*")
                .replace("*", "[^/]*")
                .replace("?", ".");
        
        return endpoint.matches(regexPattern);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ApiResource that = (ApiResource) o;
        return Objects.equals(serviceName, that.serviceName) && 
               Objects.equals(endpointPattern, that.endpointPattern) && 
               Objects.equals(httpMethod, that.httpMethod);
    }

    @Override
    public int hashCode() {
        return Objects.hash(serviceName, endpointPattern, httpMethod);
    }

    @Override
    public String toString() {
        return "ApiResource{" +
                "id=" + id +
                ", serviceName='" + serviceName + '\'' +
                ", endpointPattern='" + endpointPattern + '\'' +
                ", httpMethod='" + httpMethod + '\'' +
                ", permission=" + (permission != null ? permission.getName() : null) +
                ", description='" + description + '\'' +
                ", isActive=" + isActive +
                ", priority=" + priority +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
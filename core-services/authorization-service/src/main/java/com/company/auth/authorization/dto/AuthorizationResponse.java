package com.company.auth.authorization.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Set;

/**
 * DTO for authorization check responses
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthorizationResponse {

    private boolean authorized;
    private String reason;
    private Set<String> grantedPermissions;
    private Set<String> userRoles;
    private Long userId;
    private String resource;
    private String action;

    // Additional metadata
    private String decisionBasis;
    private long evaluationTimeMs;

    public AuthorizationResponse() {}

    public AuthorizationResponse(boolean authorized) {
        this.authorized = authorized;
    }

    public AuthorizationResponse(boolean authorized, String reason) {
        this.authorized = authorized;
        this.reason = reason;
    }

    public AuthorizationResponse(boolean authorized, String reason, Set<String> grantedPermissions, 
                                Set<String> userRoles, Long userId) {
        this.authorized = authorized;
        this.reason = reason;
        this.grantedPermissions = grantedPermissions;
        this.userRoles = userRoles;
        this.userId = userId;
    }

    // Static factory methods for common responses
    public static AuthorizationResponse authorized() {
        return new AuthorizationResponse(true, "Access granted");
    }

    public static AuthorizationResponse authorized(String reason) {
        return new AuthorizationResponse(true, reason);
    }

    public static AuthorizationResponse denied() {
        return new AuthorizationResponse(false, "Access denied");
    }

    public static AuthorizationResponse denied(String reason) {
        return new AuthorizationResponse(false, reason);
    }

    public static AuthorizationResponse userNotFound() {
        return new AuthorizationResponse(false, "User not found");
    }

    public static AuthorizationResponse insufficientPermissions() {
        return new AuthorizationResponse(false, "Insufficient permissions");
    }

    public static AuthorizationResponse invalidRequest(String reason) {
        return new AuthorizationResponse(false, "Invalid request: " + reason);
    }

    // Getters and Setters
    public boolean isAuthorized() {
        return authorized;
    }

    public void setAuthorized(boolean authorized) {
        this.authorized = authorized;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Set<String> getGrantedPermissions() {
        return grantedPermissions;
    }

    public void setGrantedPermissions(Set<String> grantedPermissions) {
        this.grantedPermissions = grantedPermissions;
    }

    public Set<String> getUserRoles() {
        return userRoles;
    }

    public void setUserRoles(Set<String> userRoles) {
        this.userRoles = userRoles;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDecisionBasis() {
        return decisionBasis;
    }

    public void setDecisionBasis(String decisionBasis) {
        this.decisionBasis = decisionBasis;
    }

    public long getEvaluationTimeMs() {
        return evaluationTimeMs;
    }

    public void setEvaluationTimeMs(long evaluationTimeMs) {
        this.evaluationTimeMs = evaluationTimeMs;
    }

    @Override
    public String toString() {
        return "AuthorizationResponse{" +
                "authorized=" + authorized +
                ", reason='" + reason + '\'' +
                ", grantedPermissions=" + grantedPermissions +
                ", userRoles=" + userRoles +
                ", userId=" + userId +
                ", resource='" + resource + '\'' +
                ", action='" + action + '\'' +
                ", decisionBasis='" + decisionBasis + '\'' +
                ", evaluationTimeMs=" + evaluationTimeMs +
                '}';
    }
}
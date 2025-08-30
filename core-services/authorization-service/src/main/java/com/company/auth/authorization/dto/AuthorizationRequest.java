package com.company.auth.authorization.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for authorization check requests
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthorizationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Resource is required")
    private String resource;

    @NotBlank(message = "Action is required")
    private String action;

    private String serviceName;
    private String endpoint;
    private String httpMethod;

    // Additional context for authorization decision
    private String userToken;
    private Object context;

    public AuthorizationRequest() {}

    public AuthorizationRequest(Long userId, String resource, String action) {
        this.userId = userId;
        this.resource = resource;
        this.action = action;
    }

    public AuthorizationRequest(Long userId, String resource, String action, String serviceName, 
                               String endpoint, String httpMethod) {
        this.userId = userId;
        this.resource = resource;
        this.action = action;
        this.serviceName = serviceName;
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
    }

    // Getters and Setters
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

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public String getUserToken() {
        return userToken;
    }

    public void setUserToken(String userToken) {
        this.userToken = userToken;
    }

    public Object getContext() {
        return context;
    }

    public void setContext(Object context) {
        this.context = context;
    }

    @Override
    public String toString() {
        return "AuthorizationRequest{" +
                "userId=" + userId +
                ", resource='" + resource + '\'' +
                ", action='" + action + '\'' +
                ", serviceName='" + serviceName + '\'' +
                ", endpoint='" + endpoint + '\'' +
                ", httpMethod='" + httpMethod + '\'' +
                ", context=" + context +
                '}';
    }
}
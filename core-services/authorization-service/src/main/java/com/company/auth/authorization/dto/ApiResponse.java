package com.company.auth.authorization.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Generic API Response wrapper
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String error;
    private String errorCode;
    private LocalDateTime timestamp;

    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }

    public ApiResponse(boolean success, String message, T data) {
        this();
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public ApiResponse(boolean success, String message, String error, String errorCode) {
        this();
        this.success = success;
        this.message = message;
        this.error = error;
        this.errorCode = errorCode;
    }

    // Static factory methods for success responses
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(true, "Operation completed successfully");
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Operation completed successfully", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    // Static factory methods for error responses
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message);
    }

    public static <T> ApiResponse<T> error(String message, String error) {
        ApiResponse<T> response = new ApiResponse<>(false, message);
        response.setError(error);
        return response;
    }

    public static <T> ApiResponse<T> error(String message, String error, String errorCode) {
        return new ApiResponse<>(false, message, error, errorCode);
    }

    // Validation error
    public static <T> ApiResponse<T> validationError(String message) {
        return new ApiResponse<>(false, message, "Validation failed", "VALIDATION_ERROR");
    }

    // Resource not found
    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(false, message, "Resource not found", "NOT_FOUND");
    }

    // Unauthorized
    public static <T> ApiResponse<T> unauthorized(String message) {
        return new ApiResponse<>(false, message, "Unauthorized access", "UNAUTHORIZED");
    }

    // Forbidden
    public static <T> ApiResponse<T> forbidden(String message) {
        return new ApiResponse<>(false, message, "Access forbidden", "FORBIDDEN");
    }

    // Internal server error
    public static <T> ApiResponse<T> serverError(String message) {
        return new ApiResponse<>(false, message, "Internal server error", "INTERNAL_ERROR");
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ApiResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", data=" + data +
                ", error='" + error + '\'' +
                ", errorCode='" + errorCode + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
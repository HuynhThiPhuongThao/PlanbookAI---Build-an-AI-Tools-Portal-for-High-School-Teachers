package com.planbook.question_bank_service.dto;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private int statusCode;
    
    // Constructor mặc định
    public ApiResponse() {}
    
    // Constructor có tham số
    public ApiResponse(boolean success, String message, T data, int statusCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }
    
    // Getters và Setters
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
    
    public int getStatusCode() {
        return statusCode;
    }
    
    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }
    
    // Static factory methods
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        response.setStatusCode(200);
        return response;
    }
    
    public static <T> ApiResponse<T> error(String message, int statusCode) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setData(null);
        response.setStatusCode(statusCode);
        return response;
    }
}
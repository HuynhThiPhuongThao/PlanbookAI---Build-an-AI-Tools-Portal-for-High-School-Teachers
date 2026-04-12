package com.planbook.question_bank_service.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private String error;
    private String message;
    private int statusCode;
    private String path;
    private LocalDateTime timestamp;
    
    // Constructor mặc định
    public ErrorResponse() {}
    
    // Constructor có tham số
    public ErrorResponse(String error, String message, int statusCode, String path, LocalDateTime timestamp) {
        this.error = error;
        this.message = message;
        this.statusCode = statusCode;
        this.path = path;
        this.timestamp = timestamp;
    }
    
    // Getters và Setters
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public int getStatusCode() {
        return statusCode;
    }
    
    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }
    
    public String getPath() {
        return path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    // Static factory method (thay thế cho builder)
    public static ErrorResponse of(String error, String message, int statusCode, String path) {
        ErrorResponse response = new ErrorResponse();
        response.setError(error);
        response.setMessage(message);
        response.setStatusCode(statusCode);
        response.setPath(path);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }
}
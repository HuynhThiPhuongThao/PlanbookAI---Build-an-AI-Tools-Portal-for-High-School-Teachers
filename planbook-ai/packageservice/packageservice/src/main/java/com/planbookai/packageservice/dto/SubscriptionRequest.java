package com.planbookai.packageservice.dto;

import lombok.Data;

@Data
public class SubscriptionRequest {
    private Long packageId;
    private String paymentMethod; // "Manual" hoặc "Momo"
}
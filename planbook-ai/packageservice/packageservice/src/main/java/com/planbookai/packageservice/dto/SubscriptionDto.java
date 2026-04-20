package com.planbookai.packageservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubscriptionDto {
    private Long id;
    private Long userId;
    private Long packageId;
    private String packageName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String paymentMethod;
}
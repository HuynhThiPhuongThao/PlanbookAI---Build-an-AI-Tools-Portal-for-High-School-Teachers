package com.planbookai.packageservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SubscriptionDto {
    private Long id;
    private Long userId;
    private Long packageId;
    private String packageName;
    private BigDecimal packagePrice;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String paymentMethod;
    private LocalDateTime createdAt;
}

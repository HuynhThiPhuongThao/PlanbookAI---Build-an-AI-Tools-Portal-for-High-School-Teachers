package com.planbookai.packageservice.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RevenueSummaryDto {
    private long totalPackages;
    private long activePackages;
    private long totalSubscriptions;
    private long pendingSubscriptions;
    private long activeSubscriptions;
    private BigDecimal estimatedRevenue;
}

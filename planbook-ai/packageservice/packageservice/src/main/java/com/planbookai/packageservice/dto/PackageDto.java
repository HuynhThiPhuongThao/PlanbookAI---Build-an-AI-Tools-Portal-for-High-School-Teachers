package com.planbookai.packageservice.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PackageDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer durationDays;
    private String description;
    private Boolean active;
}

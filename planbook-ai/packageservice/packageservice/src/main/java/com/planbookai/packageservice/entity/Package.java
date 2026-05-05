package com.planbookai.packageservice.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "packages")
@Getter
@Setter
@NoArgsConstructor
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;              // "Free", "Pro AI", "Premium"

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;         // VND: 0, 99000, 199000

    @Column(nullable = false)
    private Integer durationDays;     // 30, 90, 365

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Boolean active = true;    // MANAGER có thể ẩn gói
    @Column(nullable = false)
    private Boolean highlight = false;
}

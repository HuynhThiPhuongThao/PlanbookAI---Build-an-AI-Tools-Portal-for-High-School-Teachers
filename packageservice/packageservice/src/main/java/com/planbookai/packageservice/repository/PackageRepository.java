package com.planbookai.packageservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.planbookai.packageservice.entity.Package;

public interface PackageRepository extends JpaRepository<Package, Long> {
    // Chỉ lấy các gói đang active để hiển thị cho Teacher
    List<Package> findByActiveTrue();
}
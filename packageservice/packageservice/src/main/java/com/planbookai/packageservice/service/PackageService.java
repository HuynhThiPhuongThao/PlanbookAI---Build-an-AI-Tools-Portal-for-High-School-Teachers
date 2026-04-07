package com.planbookai.packageservice.service;

import com.planbookai.packageservice.dto.PackageDto;
import com.planbookai.packageservice.dto.PackageCreateRequest;
import java.util.List;

public interface PackageService {
    List<PackageDto> getAllPackages();
    PackageDto createPackage(PackageCreateRequest request);
    // Thêm phương thức subscribe, getSubscriptionByUserId nếu cần
}
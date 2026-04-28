package com.planbookai.packageservice.service;

import com.planbookai.packageservice.dto.PackageCreateRequest;
import com.planbookai.packageservice.dto.PackageDto;
import com.planbookai.packageservice.dto.RevenueSummaryDto;
import com.planbookai.packageservice.dto.SubscriptionDto;
import com.planbookai.packageservice.dto.SubscriptionRequest;

import java.util.List;

public interface PackageService {
    List<PackageDto> getAllPackages();
    PackageDto createPackage(PackageCreateRequest request);
    PackageDto updatePackage(Long id, PackageCreateRequest request);
    void deletePackage(Long id);
    SubscriptionDto subscribe(SubscriptionRequest request, Long userId);
    SubscriptionDto confirmPayment(Long subscriptionId, Long userId);
    SubscriptionDto cancelSubscription(Long subscriptionId, Long userId);
    SubscriptionDto approveSubscription(Long id);
    SubscriptionDto rejectSubscription(Long id);
    List<SubscriptionDto> getSubscriptionsByUser(Long userId);
    List<SubscriptionDto> getAllSubscriptions();
    RevenueSummaryDto getRevenueSummary();
    /** SePay webhook: tìm subscription theo nội dung CK và kích hoạt */
    boolean activateByTransferNote(String content, double amount);
}

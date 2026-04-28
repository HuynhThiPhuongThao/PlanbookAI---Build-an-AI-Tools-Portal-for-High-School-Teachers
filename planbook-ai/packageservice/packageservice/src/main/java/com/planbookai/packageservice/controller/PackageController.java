package com.planbookai.packageservice.controller;

import com.planbookai.packageservice.dto.PackageCreateRequest;
import com.planbookai.packageservice.dto.PackageDto;
import com.planbookai.packageservice.dto.RevenueSummaryDto;
import com.planbookai.packageservice.dto.SubscriptionDto;
import com.planbookai.packageservice.dto.SubscriptionRequest;
import com.planbookai.packageservice.service.PackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PackageController {

    private final PackageService packageService;

    public PackageController(PackageService packageService) {
        this.packageService = packageService;
    }

    @GetMapping("/packages")
    public List<PackageDto> getAllPackages() {
        return packageService.getAllPackages();
    }

    @PostMapping("/packages")
    @PreAuthorize("hasRole('MANAGER')")
    public PackageDto createPackage(@RequestBody PackageCreateRequest request) {
        return packageService.createPackage(request);
    }

    @PutMapping("/packages/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public PackageDto updatePackage(@PathVariable Long id, @RequestBody PackageCreateRequest request) {
        return packageService.updatePackage(id, request);
    }

    @DeleteMapping("/packages/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<String> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok("Package disabled successfully");
    }

    @GetMapping("/packages/revenue-summary")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public RevenueSummaryDto getRevenueSummary() {
        return packageService.getRevenueSummary();
    }

    @PostMapping("/subscriptions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<SubscriptionDto> subscribe(
            @RequestBody SubscriptionRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(packageService.subscribe(request, userId));
    }

    @PostMapping("/subscriptions/{id}/confirm-payment")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> confirmPayment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(packageService.confirmPayment(id, userId));
    }

    @PutMapping("/subscriptions/{id}/cancel")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> cancelSubscription(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(packageService.cancelSubscription(id, userId));
    }

    @GetMapping("/subscriptions/my")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getMySubscriptions(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(packageService.getSubscriptionsByUser(userId));
    }

    @PutMapping("/subscriptions/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<?> approveSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.approveSubscription(id));
    }

    @PutMapping("/subscriptions/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<?> rejectSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.rejectSubscription(id));
    }

    @GetMapping("/subscriptions")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<?> getAllSubscriptions() {
        return ResponseEntity.ok(packageService.getAllSubscriptions());
    }
}

package com.planbookai.packageservice.controller;

import com.planbookai.packageservice.dto.PackageCreateRequest;
import com.planbookai.packageservice.dto.PackageDto;
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

    // Thay @RequiredArgsConstructor bằng constructor thường
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

    @PostMapping("/subscriptions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<String> subscribe(
            @RequestBody SubscriptionRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        packageService.subscribe(request, userId);
        return ResponseEntity.ok("Subscription created successfully");
    }

    @GetMapping("/subscriptions/my")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getMySubscriptions(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(packageService.getSubscriptionsByUser(userId));
    }
}
package com.planbookai.packageservice.service;

import com.planbookai.packageservice.dto.PackageCreateRequest;
import com.planbookai.packageservice.dto.PackageDto;
import com.planbookai.packageservice.dto.RevenueSummaryDto;
import com.planbookai.packageservice.dto.SubscriptionDto;
import com.planbookai.packageservice.dto.SubscriptionRequest;
import com.planbookai.packageservice.entity.Package;
import com.planbookai.packageservice.entity.Subscription;
import com.planbookai.packageservice.entity.SubscriptionStatus;
import com.planbookai.packageservice.exception.NotFoundException;
import com.planbookai.packageservice.repository.PackageRepository;
import com.planbookai.packageservice.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageServiceImpl implements PackageService {

    private final PackageRepository packageRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Override
    public List<PackageDto> getAllPackages() {
        return packageRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PackageDto createPackage(PackageCreateRequest request) {
        Package pkg = new Package();
        applyPackageRequest(pkg, request);
        Package saved = packageRepository.save(pkg);
        return toDto(saved);
    }

    @Override
    public PackageDto updatePackage(Long id, PackageCreateRequest request) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Package not found: " + id));

        applyPackageRequest(pkg, request);
        return toDto(packageRepository.save(pkg));
    }

    @Override
    public void deletePackage(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Package not found: " + id));

        pkg.setActive(false);
        packageRepository.save(pkg);
    }

    @Override
    public SubscriptionDto subscribe(SubscriptionRequest request, Long userId) {
        Package pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new NotFoundException("Package not found: " + request.getPackageId()));

        boolean hasOpenSubscription = subscriptionRepository.findByUserId(userId).stream()
                .anyMatch(sub -> sub.getPkg().getId().equals(pkg.getId())
                        && (sub.getStatus() == SubscriptionStatus.PENDING
                                || sub.getStatus() == SubscriptionStatus.ACTIVE));
        if (hasOpenSubscription) {
            throw new IllegalStateException("Teacher already has a pending or active subscription for this package");
        }

        Subscription sub = new Subscription();
        sub.setUserId(userId);
        sub.setPkg(pkg);
        sub.setStartDate(LocalDateTime.now());
        sub.setEndDate(LocalDateTime.now().plusDays(pkg.getDurationDays()));
        sub.setStatus(SubscriptionStatus.PENDING);
        sub.setPaymentMethod(request.getPaymentMethod());
        return toSubscriptionDto(subscriptionRepository.save(sub));
    }

    @Override
    public SubscriptionDto confirmPayment(Long subscriptionId, Long userId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new NotFoundException("Subscription not found: " + subscriptionId));

        if (!sub.getUserId().equals(userId)) {
            throw new IllegalStateException("You can only confirm payment for your own subscription");
        }
        if (sub.getStatus() != SubscriptionStatus.PENDING) {
            throw new IllegalStateException("Subscription is not in PENDING state");
        }

        LocalDateTime now = LocalDateTime.now();
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartDate(now);
        sub.setEndDate(now.plusDays(sub.getPkg().getDurationDays()));
        sub.setPaymentMethod("BANK_TRANSFER");
        return toSubscriptionDto(subscriptionRepository.save(sub));
    }

    @Override
    public SubscriptionDto cancelSubscription(Long subscriptionId, Long userId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new NotFoundException("Subscription not found: " + subscriptionId));

        if (!sub.getUserId().equals(userId)) {
            throw new IllegalStateException("You can only cancel your own subscription");
        }
        if (sub.getStatus() != SubscriptionStatus.PENDING) {
            throw new IllegalStateException("Only pending subscriptions can be cancelled");
        }

        sub.setStatus(SubscriptionStatus.CANCELLED);
        return toSubscriptionDto(subscriptionRepository.save(sub));
    }

    @Override
    public SubscriptionDto approveSubscription(Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subscription not found: " + id));

        LocalDateTime now = LocalDateTime.now();
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartDate(now);
        sub.setEndDate(now.plusDays(sub.getPkg().getDurationDays()));
        return toSubscriptionDto(subscriptionRepository.save(sub));
    }

    @Override
    public SubscriptionDto rejectSubscription(Long id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subscription not found: " + id));

        sub.setStatus(SubscriptionStatus.REJECTED);
        return toSubscriptionDto(subscriptionRepository.save(sub));
    }

    @Override
    public List<SubscriptionDto> getSubscriptionsByUser(Long userId) {
        return subscriptionRepository.findByUserId(userId).stream()
                .map(this::toSubscriptionDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubscriptionDto> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::toSubscriptionDto)
                .collect(Collectors.toList());
    }

    @Override
    public RevenueSummaryDto getRevenueSummary() {
        List<Package> packages = packageRepository.findAll();
        List<Subscription> subscriptions = subscriptionRepository.findAll();

        BigDecimal estimatedRevenue = subscriptions.stream()
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE || sub.getStatus() == SubscriptionStatus.PENDING)
                .map(sub -> sub.getPkg().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        RevenueSummaryDto summary = new RevenueSummaryDto();
        summary.setTotalPackages(packages.size());
        summary.setActivePackages(packages.stream().filter(pkg -> Boolean.TRUE.equals(pkg.getActive())).count());
        summary.setTotalSubscriptions(subscriptions.size());
        summary.setPendingSubscriptions(subscriptions.stream().filter(sub -> sub.getStatus() == SubscriptionStatus.PENDING).count());
        summary.setActiveSubscriptions(subscriptions.stream().filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE).count());
        summary.setEstimatedRevenue(estimatedRevenue);
        return summary;
    }

    @Override
    public boolean activateByTransferNote(String content, double amount) {
        if (content == null || content.isBlank()) return false;

        // Format nội dung CK: "PLANBOOK {subscriptionId}" (case-insensitive, có thể có prefix)
        Matcher matcher = Pattern.compile("PLANBOOK\\s+(\\d+)", Pattern.CASE_INSENSITIVE).matcher(content);
        if (!matcher.find()) return false;

        long subId = Long.parseLong(matcher.group(1));
        Subscription sub = subscriptionRepository.findById(subId).orElse(null);
        if (sub == null || sub.getStatus() != SubscriptionStatus.PENDING) return false;

        LocalDateTime now = LocalDateTime.now();
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartDate(now);
        sub.setEndDate(now.plusDays(sub.getPkg().getDurationDays()));
        sub.setPaymentMethod("SEPAY_BANK_TRANSFER");
        subscriptionRepository.save(sub);
        return true;
    }

    private void applyPackageRequest(Package pkg, PackageCreateRequest request) {
        pkg.setName(request.getName());
        pkg.setPrice(request.getPrice());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setDescription(request.getDescription());
        if (request.getActive() != null) {
            pkg.setActive(request.getActive());
        }
        if (request.getHighlight() != null) {
            pkg.setHighlight(request.getHighlight());
        }
    }

    private PackageDto toDto(Package pkg) {
        PackageDto dto = new PackageDto();
        dto.setId(pkg.getId());
        dto.setName(pkg.getName());
        dto.setPrice(pkg.getPrice());
        dto.setDurationDays(pkg.getDurationDays());
        dto.setDescription(pkg.getDescription());
        dto.setActive(pkg.getActive());
        dto.setHighlight(pkg.getHighlight());
        return dto;
    }

    private SubscriptionDto toSubscriptionDto(Subscription sub) {
        SubscriptionDto dto = new SubscriptionDto();
        dto.setId(sub.getId());
        dto.setUserId(sub.getUserId());
        dto.setPackageId(sub.getPkg().getId());
        dto.setPackageName(sub.getPkg().getName());
        dto.setPackagePrice(sub.getPkg().getPrice());
        dto.setStartDate(sub.getStartDate());
        dto.setEndDate(sub.getEndDate());
        dto.setStatus(sub.getStatus().name());
        dto.setPaymentMethod(sub.getPaymentMethod());
        dto.setCreatedAt(sub.getCreatedAt());
        return dto;
    }
}

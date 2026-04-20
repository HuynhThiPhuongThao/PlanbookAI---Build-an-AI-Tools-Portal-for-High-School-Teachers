package com.planbookai.packageservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.planbookai.packageservice.entity.Subscription;
import com.planbookai.packageservice.entity.SubscriptionStatus;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    // Xem tất cả subscription của một user (Teacher xem lịch sử)
    List<Subscription> findByUserId(Long userId);

    // Kiểm tra user đang có gói ACTIVE chưa
    Optional<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
}
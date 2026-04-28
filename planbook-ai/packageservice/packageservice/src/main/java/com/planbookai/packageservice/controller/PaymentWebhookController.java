package com.planbookai.packageservice.controller;

import com.planbookai.packageservice.service.PackageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SePay payment webhook — nhận thông báo chuyển khoản từ SePay
 * và kích hoạt subscription tương ứng dựa trên nội dung CK.
 *
 * Endpoint PUBLIC (không cần JWT) — đã whitelist trong API Gateway.
 * SePay gửi POST tới: https://yourdomain.com/api/payment/webhook/sepay
 *
 * Định dạng nội dung chuyển khoản: "PLANBOOK {subscriptionId}"
 * Ví dụ: "PLANBOOK 42" → kích hoạt subscription có id=42
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentWebhookController {

    private static final Logger log = LoggerFactory.getLogger(PaymentWebhookController.class);

    private final PackageService packageService;

    @Value("${sepay.webhook-token:}")
    private String sePayWebhookToken;

    public PaymentWebhookController(PackageService packageService) {
        this.packageService = packageService;
    }

    /**
     * SePay gọi endpoint này khi nhận được tiền.
     * Body example:
     * {
     *   "id": 12345,
     *   "gateway": "Vietcombank",
     *   "transferType": "in",
     *   "transferAmount": 5000,
     *   "content": "PLANBOOK 42",
     *   "accountNumber": "1234567890"
     * }
     */
    @PostMapping("/webhook/sepay")
    public ResponseEntity<Map<String, Object>> sePayWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // ── Validate SePay token (nếu đã cấu hình) ──────────────────
        if (!sePayWebhookToken.isBlank()) {
            String expected = "Bearer " + sePayWebhookToken;
            if (!expected.equals(authHeader)) {
                log.warn("[SePay] Webhook received with invalid token");
                return ResponseEntity.status(401)
                        .body(Map.of("success", false, "message", "Invalid token"));
            }
        }

        // ── Chỉ xử lý giao dịch đến (in) ────────────────────────────
        String transferType = String.valueOf(payload.getOrDefault("transferType", ""));
        if (!"in".equals(transferType)) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Ignored outgoing transfer"));
        }

        String content = String.valueOf(payload.getOrDefault("content", ""));
        double amount  = Double.parseDouble(String.valueOf(payload.getOrDefault("transferAmount", 0)));

        log.info("[SePay] Webhook: content='{}', amount={}", content, amount);

        boolean activated = packageService.activateByTransferNote(content, amount);

        if (activated) {
            log.info("[SePay] Subscription activated via transfer note: '{}'", content);
            return ResponseEntity.ok(Map.of("success", true, "message", "Subscription activated"));
        } else {
            log.warn("[SePay] No matching PENDING subscription for content: '{}'", content);
            // Trả 200 để SePay không retry — chỉ không tìm thấy sub, không phải lỗi server
            return ResponseEntity.ok(Map.of("success", true, "message", "No matching subscription"));
        }
    }
}

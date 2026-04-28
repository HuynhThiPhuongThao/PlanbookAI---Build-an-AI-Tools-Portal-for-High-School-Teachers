package com.planbookai.packageservice.config;

import com.planbookai.packageservice.entity.Package;
import com.planbookai.packageservice.repository.PackageRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PackageDataInitializer implements CommandLineRunner {

    private final PackageRepository packageRepository;

    @Override
    public void run(String... args) {
        deactivatePackage("Free");
        deactivatePackage("Pro AI");
        deactivatePackage("School");

        packageRepository.saveAll(List.of(
                upsertPackage(
                        "Plus",
                        BigDecimal.valueOf(99000),
                        30,
                        "Goi ca nhan cho giao vien muon su dung AI hang ngay voi cac tinh nang cot loi."),
                upsertPackage(
                        "Team",
                        BigDecimal.valueOf(299000),
                        30,
                        "Goi cho to chuyen mon hoac nhom giao vien can chia se tai nguyen va lam viec chung."),
                upsertPackage(
                        "Pro",
                        BigDecimal.valueOf(499000),
                        30,
                        "Goi nang cao cho giao vien can day du cong cu AI, OCR va bao cao hoc tap.")));
    }

    private Package upsertPackage(String name, BigDecimal price, Integer durationDays, String description) {
        Package pkg = packageRepository.findByName(name).orElseGet(Package::new);
        pkg.setName(name);
        pkg.setPrice(price);
        pkg.setDurationDays(durationDays);
        pkg.setDescription(description);
        pkg.setActive(true);
        return pkg;
    }

    private void deactivatePackage(String name) {
        packageRepository.findByName(name).ifPresent(pkg -> {
            pkg.setActive(false);
            packageRepository.save(pkg);
        });
    }
}

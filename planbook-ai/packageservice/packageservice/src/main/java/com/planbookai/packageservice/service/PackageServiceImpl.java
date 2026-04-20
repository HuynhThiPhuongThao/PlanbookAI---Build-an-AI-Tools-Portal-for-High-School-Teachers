package com.planbookai.packageservice.service;

import com.planbookai.packageservice.dto.PackageDto;
import com.planbookai.packageservice.dto.PackageCreateRequest;
import com.planbookai.packageservice.entity.Package;
import com.planbookai.packageservice.repository.PackageRepository;
import com.planbookai.packageservice.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageServiceImpl implements PackageService {

    private final PackageRepository packageRepository;

    @Override
    public List<PackageDto> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PackageDto createPackage(PackageCreateRequest request) {
        Package pkg = new Package();
        pkg.setName(request.getName());
        pkg.setPrice(request.getPrice());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setDescription(request.getDescription());
        Package saved = packageRepository.save(pkg);
        return toDto(saved);
    }

    private PackageDto toDto(Package pkg) {
        PackageDto dto = new PackageDto();
        dto.setId(pkg.getId());
        dto.setName(pkg.getName());
        dto.setPrice(pkg.getPrice());
        dto.setDurationDays(pkg.getDurationDays());
        dto.setDescription(pkg.getDescription());
        return dto;
    }
}
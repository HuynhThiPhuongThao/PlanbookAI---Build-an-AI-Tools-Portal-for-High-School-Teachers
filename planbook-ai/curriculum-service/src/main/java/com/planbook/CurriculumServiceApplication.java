package com.planbook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching // Kích hoạt tính năng Cache (Memory Cache) cho ứng dụng
public class CurriculumServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CurriculumServiceApplication.class, args);
    }
}
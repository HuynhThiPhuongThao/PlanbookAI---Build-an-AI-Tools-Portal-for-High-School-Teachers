package com.planbook.repository;

import com.planbook.entity.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {
    // Có thể thêm query tùy chỉnh sau này, ví dụ:
    // List<Curriculum> findByNameContaining(String keyword);
}

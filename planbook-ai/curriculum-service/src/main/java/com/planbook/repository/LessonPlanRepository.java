package com.planbook.repository;

import com.planbook.entity.LessonPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonPlanRepository extends JpaRepository<LessonPlan, Long> {
    List<LessonPlan> findByTeacherId(Long teacherId);
    List<LessonPlan> findByTopicId(Long topicId);
}

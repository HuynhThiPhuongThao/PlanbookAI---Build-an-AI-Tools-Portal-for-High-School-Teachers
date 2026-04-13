package com.planbook.repository.teacher;

import com.planbook.entity.teacher.LessonPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonPlanRepository extends JpaRepository<LessonPlan, Long> {
    List<LessonPlan> findByTeacherId(Long teacherId);
    List<LessonPlan> findByTopicId(Long topicId);
}

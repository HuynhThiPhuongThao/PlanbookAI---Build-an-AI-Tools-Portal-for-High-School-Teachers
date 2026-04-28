package com.planbook.repository.staff;

import com.planbook.entity.staff.SampleLessonPlan;
import com.planbook.enums.SampleLessonPlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SampleLessonPlanRepository extends JpaRepository<SampleLessonPlan, Long> {

    List<SampleLessonPlan> findByStaffId(Long staffId);

    List<SampleLessonPlan> findByStatus(SampleLessonPlanStatus status);

    List<SampleLessonPlan> findByStatusInOrderByUpdatedAtDesc(List<SampleLessonPlanStatus> statuses);

    List<SampleLessonPlan> findByTopicIdAndStatus(Long topicId, SampleLessonPlanStatus status);

    List<SampleLessonPlan> findByCurriculumTemplateIdAndStatus(Long curriculumTemplateId, SampleLessonPlanStatus status);

    List<SampleLessonPlan> findByTopicIdAndCurriculumTemplateIdAndStatus(
            Long topicId,
            Long curriculumTemplateId,
            SampleLessonPlanStatus status
    );

    @Query("""
            select sample
            from SampleLessonPlan sample
            where sample.topic.id = :topicId
              and sample.status = :status
              and (
                    sample.curriculumTemplate.id = :curriculumTemplateId
                    or sample.curriculumTemplate is null
                  )
            order by sample.updatedAt desc
            """)
    List<SampleLessonPlan> findApprovedForTopicAndOptionalTemplate(
            @Param("topicId") Long topicId,
            @Param("curriculumTemplateId") Long curriculumTemplateId,
            @Param("status") SampleLessonPlanStatus status
    );
}

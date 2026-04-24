package com.planbook.service.staff;

import com.planbook.dto.staff.SubjectRequest;
import com.planbook.dto.staff.SubjectResponse;
import com.planbook.entity.staff.Subject;
import com.planbook.repository.staff.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private SubjectService subjectService;

    private Subject subject;

    @BeforeEach
    void setUp() {
        subject = new Subject();
        subject.setId(1L);
        subject.setName("Mathematics");
        subject.setDescription("Math concepts");
    }

    @Test
    void testCreateSubject() {
        SubjectRequest request = new SubjectRequest();
        request.setName("Mathematics");
        request.setDescription("Math concepts");

        when(subjectRepository.save(any(Subject.class))).thenReturn(subject);

        SubjectResponse response = subjectService.createSubject(request);

        assertNotNull(response);
        assertEquals("Mathematics", response.getName());
        verify(subjectRepository, times(1)).save(any(Subject.class));
    }
}

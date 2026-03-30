package com.planbook.controller;

import com.planbook.entity.Course;
import com.planbook.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @GetMapping
    public List<Course> getCourses() {
        return courseRepository.findAll(); // lấy dữ liệu từ MySQL
    }

    @PostMapping
    public Course addCourse(@RequestBody Course course) {
        return courseRepository.save(course); // thêm dữ liệu vào MySQL
    }
}

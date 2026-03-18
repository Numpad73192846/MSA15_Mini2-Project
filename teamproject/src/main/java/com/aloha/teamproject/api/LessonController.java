package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.Lesson;
import com.aloha.teamproject.service.LessonService;
import com.aloha.teamproject.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;
    private final UserService userService;

    @GetMapping
    public ApiResponse<List<Lesson>> getAllLessons() {
        try {
            List<Lesson> lessons = lessonService.selectAll();
            return ApiResponse.ok(lessons);
        } catch (Exception e) {
            log.error("수업 목록 조회 실패", e);
            return ApiResponse.error("수업 목록을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Lesson> getLesson(@PathVariable("id") String id) {
        try {
            Lesson lesson = lessonService.selectById(id);
            return ApiResponse.ok(lesson);
        } catch (Exception e) {
            log.error("수업 조회 실패", e);
            return ApiResponse.error("수업을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/my")
    public ApiResponse<List<Lesson>> getMyLessons(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            List<Lesson> lessons = lessonService.selectByUserId(userId);
            return ApiResponse.ok(lessons);
        } catch (Exception e) {
            log.error("내 수업 목록 조회 실패", e);
            return ApiResponse.error("수업 목록을 조회하지 못했습니다.");
        }
    }

    @PostMapping
    public ApiResponse<Void> createLesson(@RequestBody Lesson.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            Lesson lesson = Lesson.builder()
                .userId(userId)
                .subjectId(request.getSubjectId())
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .fieldId(request.getFieldId())
                .build();

            lessonService.insert(lesson);
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("수업 생성 실패", e);
            return ApiResponse.error("수업을 생성하지 못했습니다.");
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateLesson(@PathVariable("id") String id, @RequestBody Lesson.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            Lesson existing = lessonService.selectById(id);
            if (existing == null) {
                return ApiResponse.error("수업을 찾을 수 없습니다.");
            }
            if (!userId.equals(existing.getUserId())) {
                return ApiResponse.error("본인 수업만 수정할 수 있습니다.");
            }

            Lesson lesson = Lesson.builder()
                .id(id)
                .subjectId(request.getSubjectId() != null ? request.getSubjectId() : existing.getSubjectId())
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .fieldId(request.getFieldId() != null ? request.getFieldId() : existing.getFieldId())
                .build();

            lessonService.update(lesson);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("수업 수정 실패", e);
            return ApiResponse.error("수업을 수정하지 못했습니다.");
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteLesson(@PathVariable("id") String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            Lesson existing = lessonService.selectById(id);
            if (existing == null) {
                return ApiResponse.error("수업을 찾을 수 없습니다.");
            }
            if (!userId.equals(existing.getUserId())) {
                return ApiResponse.error("본인 수업만 삭제할 수 있습니다.");
            }

            lessonService.delete(id);
            return ApiResponse.ok(SuccessCode.DELETED);
        } catch (Exception e) {
            log.error("수업 삭제 실패", e);
            return ApiResponse.error("수업을 삭제하지 못했습니다.");
        }
    }

    private String resolveUserId(String authName) {
        if (!StringUtils.hasText(authName)) {
            return null;
        }

        try {
            return userService.selectById(authName).getId();
        } catch (Exception ignored) {
            // fall through
        }
        try {
            return userService.selectByUsername(authName).getId();
        } catch (Exception ignored) {
            return null;
        }
    }

}

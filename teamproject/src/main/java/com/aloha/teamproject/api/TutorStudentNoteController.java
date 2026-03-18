package com.aloha.teamproject.api;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.service.TutorStudentNoteService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tutor/students")
public class TutorStudentNoteController {

    private final TutorStudentNoteService tutorStudentNoteService;

    @PutMapping("/note")
    public ApiResponse<Void> saveNote(
        @RequestBody TutorStudentNoteRequest request,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }
        if (request == null) {
            return ApiResponse.error("요청이 올바르지 않습니다.");
        }

        try {
            String tutorId = authentication.getName();
            tutorStudentNoteService.saveNote(
                tutorId,
                request.getStudentId(),
                request.getProgress(),
                request.getNotes()
            );
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("학생 노트 저장 실패", e);
            return ApiResponse.error("학생 노트를 저장하지 못했습니다.");
        }
    }

    @Data
    public static class TutorStudentNoteRequest {
        private String studentId;
        private String progress;
        private String notes;
    }
}

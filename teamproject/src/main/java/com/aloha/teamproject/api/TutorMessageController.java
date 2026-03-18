package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.TutorMessage;
import com.aloha.teamproject.service.TutorMessageService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tutor/messages")
public class TutorMessageController {

    private final TutorMessageService tutorMessageService;

    @PostMapping
    public ApiResponse<Void> sendMessage(
        @RequestBody TutorMessageRequest request,
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
            tutorMessageService.sendMessage(tutorId, request.getStudentId(), request.getBookingId(), request.getContent());
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("튜터 메시지 전송 실패", e);
            return ApiResponse.error("메시지 전송에 실패했습니다.");
        }
    }

    @GetMapping("/thread")
    public ApiResponse<List<TutorMessage>> getThread(
        @RequestParam("studentId") String studentId,
        @RequestParam("bookingId") String bookingId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String tutorId = authentication.getName();
            List<TutorMessage> messages = tutorMessageService.selectThread(tutorId, studentId, bookingId);
            return ApiResponse.ok(messages, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("대화 스레드 조회 실패", e);
            return ApiResponse.error("대화 내역을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/thread/member")
    public ApiResponse<List<TutorMessage>> getThreadForMember(
        @RequestParam("tutorId") String tutorId,
        @RequestParam("bookingId") String bookingId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String studentId = authentication.getName();
            List<TutorMessage> messages = tutorMessageService.selectThread(tutorId, studentId, bookingId);
            return ApiResponse.ok(messages, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("회원 메시지 스레드 조회 실패", e);
            return ApiResponse.error("대화 내역을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/reply-writable")
    public ApiResponse<Boolean> isReplyWritable(
        @RequestParam("tutorId") String tutorId,
        @RequestParam("bookingId") String bookingId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String studentId = authentication.getName();
            boolean writable = tutorMessageService.isReplyWritable(studentId, tutorId, bookingId);
            return ApiResponse.ok(writable, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("답장 가능 여부 조회 실패", e);
            return ApiResponse.error("답장 가능 여부를 확인하지 못했습니다.");
        }
    }

    @PostMapping("/reply")
    public ApiResponse<Void> sendReply(
        @RequestBody TutorMessageReplyRequest request,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }
        if (request == null) {
            return ApiResponse.error("요청이 올바르지 않습니다.");
        }

        try {
            String studentId = authentication.getName();
            tutorMessageService.sendReply(studentId, request.getTutorId(), request.getBookingId(), request.getContent());
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("학생 답장 전송 실패", e);
            return ApiResponse.error("답장 전송에 실패했습니다.");
        }
    }

    @Data
    public static class TutorMessageRequest {
        private String studentId;
        private String bookingId;
        private String content;
    }

    @Data
    public static class TutorMessageReplyRequest {
        private String tutorId;
        private String bookingId;
        private String content;
    }
}

package com.aloha.teamproject.api;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.TutorAvailability;
import com.aloha.teamproject.service.TutorAvailabilityService;
import com.aloha.teamproject.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tutors")
public class TutorAvailabilityController {

    private final TutorAvailabilityService tutorAvailabilityService;
    private final UserService userService;

    @GetMapping("/me/availability")
    public ApiResponse<List<TutorAvailability>> getMyAvailability(
            @RequestParam("start") String start,
            @RequestParam("end") String end,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            LocalDateTime startDate = parseDateTimeOrNull(start);
            LocalDateTime endDate = parseDateTimeOrNull(end);
            if (startDate == null || endDate == null) {
                return ApiResponse.error("잘못된 날짜 형식입니다.");
            }

            List<TutorAvailability> availabilities =
                    tutorAvailabilityService.selectByUserIdAndDateRange(userId, startDate, endDate);
            return ApiResponse.ok(availabilities);
        } catch (Exception e) {
            log.error("가용 시간 조회 실패", e);
            return ApiResponse.error("가용 시간을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{tutorId}/availability")
    public ApiResponse<List<TutorAvailability>> getTutorAvailability(
            @PathVariable("tutorId") String tutorId,
            @RequestParam("start") String start,
            @RequestParam("end") String end
    ) {
        try {
            LocalDateTime startDate = parseDateTimeOrNull(start);
            LocalDateTime endDate = parseDateTimeOrNull(end);
            if (startDate == null || endDate == null) {
                return ApiResponse.error("잘못된 날짜 형식입니다.");
            }

            List<TutorAvailability> availabilities =
                    tutorAvailabilityService.selectByUserIdAndDateRange(tutorId, startDate, endDate);

            List<TutorAvailability> dtoList = availabilities.stream()
                    .filter(av -> av.getStatus() == TutorAvailability.Status.OPEN
                            || av.getStatus() == TutorAvailability.Status.BOOKED)
                    .toList();

            return ApiResponse.ok(dtoList);
        } catch (Exception e) {
            log.error("튜터 가용 시간 조회 실패", e);
            return ApiResponse.error("가용 시간을 조회하지 못했습니다.");
        }
    }

    @PostMapping("/me/availability")
    public ApiResponse<Void> saveMyAvailability(
            @RequestParam("start") String start,
            @RequestParam("end") String end,
            @RequestBody List<TutorAvailability> availabilityDTO,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            LocalDateTime startDate = parseDateTimeOrNull(start);
            LocalDateTime endDate = parseDateTimeOrNull(end);
            if (startDate == null || endDate == null) {
                return ApiResponse.error("잘못된 날짜 형식입니다.");
            }

            List<TutorAvailability> availabilities = availabilityDTO.stream()
                    .peek(dto -> {
                        dto.setUserId(userId);
                        if (dto.getStatus() == null) {
                            dto.setStatus(TutorAvailability.Status.OPEN);
                        }
                    })
                    .toList();

            tutorAvailabilityService.replaceAvailabilities(userId, startDate, endDate, availabilities);
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("가용 시간 저장 실패", e);
            return ApiResponse.error("가용 시간을 저장하지 못했습니다.");
        }
    }

    @PatchMapping("/me/availability/{id}/status")
    public ApiResponse<Void> updateAvailabilityStatus(
            @PathVariable("id") String id,
            @RequestParam("status") String status,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            tutorAvailabilityService.updateStatus(id, status);
            return ApiResponse.ok(SuccessCode.OK);
        } catch (Exception e) {
            log.error("가용 시간 상태 변경 실패", e);
            return ApiResponse.error("상태를 변경하지 못했습니다.");
        }
    }

    @DeleteMapping("/me/availability/{id}")
    public ApiResponse<Void> deleteAvailability(
            @PathVariable("id") String id,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            tutorAvailabilityService.deleteById(id);
            return ApiResponse.ok(SuccessCode.OK);
        } catch (Exception e) {
            log.error("가용 시간 삭제 실패", e);
            return ApiResponse.error("가용 시간을 삭제하지 못했습니다.");
        }
    }

    private LocalDateTime parseDateTimeOrNull(String value) {
        try {
            return LocalDateTime.parse(value);
        } catch (Exception e) {
            log.warn("Invalid datetime format: {}", value, e);
            return null;
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

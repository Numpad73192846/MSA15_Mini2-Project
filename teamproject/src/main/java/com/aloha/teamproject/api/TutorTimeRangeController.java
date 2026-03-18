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
import com.aloha.teamproject.dto.TutorTimeRange;
import com.aloha.teamproject.service.TutorTimeRangeService;
import com.aloha.teamproject.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tutors/me/time-ranges")
public class TutorTimeRangeController {

    private final TutorTimeRangeService tutorTimeRangeService;
    private final UserService userService;

    /**
     * 내 기본 시간대 조회
     */
    @GetMapping
    public ApiResponse<List<TutorTimeRange>> getMyTimeRanges(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }
            List<TutorTimeRange> timeRanges = tutorTimeRangeService.selectByUserId(userId);
            return ApiResponse.ok(timeRanges);
        } catch (Exception e) {
            log.error("기본 시간대 조회 실패", e);
            return ApiResponse.error("기본 시간대를 조회하지 못했습니다.");
        }
    }

    /**
     * 내 기본 시간대 일괄 저장 (기존 전체 삭제 후 재생성)
     */
    @PostMapping
    public ApiResponse<Void> saveMyTimeRanges(
                @RequestBody List<TutorTimeRange> timeRangeDTOs,
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
                List<TutorTimeRange> timeRanges = timeRangeDTOs.stream()
                    .peek(dto -> dto.setUserId(userId))
                    .toList();

            tutorTimeRangeService.replaceTimeRanges(userId, timeRanges);
            
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("기본 시간대 저장 실패", e);
            return ApiResponse.error("기본 시간대를 저장하지 못했습니다.");
        }
    }

    /**
     * 기본 시간대 단건 추가
     */
    @PostMapping("/single")
    public ApiResponse<Void> addTimeRange(
                @RequestBody TutorTimeRange dto,
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
            TutorTimeRange timeRange = dto;
            timeRange.setUserId(userId);
            tutorTimeRangeService.insert(timeRange);
            
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("기본 시간대 추가 실패", e);
            return ApiResponse.error("기본 시간대를 추가하지 못했습니다.");
        }
    }

    /**
     * 기본 시간대 수정
     */
    @PutMapping("/{id}")
    public ApiResponse<Void> updateTimeRange(
            @PathVariable String id,
                @RequestBody TutorTimeRange dto,
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
            TutorTimeRange timeRange = dto;
            timeRange.setUserId(userId);
            timeRange.setId(id);
            
            tutorTimeRangeService.update(timeRange);
            
            return ApiResponse.ok(SuccessCode.OK);
        } catch (Exception e) {
            log.error("기본 시간대 수정 실패", e);
            return ApiResponse.error("기본 시간대를 수정하지 못했습니다.");
        }
    }

    /**
     * 기본 시간대 삭제
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTimeRange(
            @PathVariable String id,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            tutorTimeRangeService.deleteById(id);
            return ApiResponse.ok(SuccessCode.OK);
        } catch (Exception e) {
            log.error("기본 시간대 삭제 실패", e);
            return ApiResponse.error("기본 시간대를 삭제하지 못했습니다.");
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

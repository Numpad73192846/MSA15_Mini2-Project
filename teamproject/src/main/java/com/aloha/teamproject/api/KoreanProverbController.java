package com.aloha.teamproject.api;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.KoreanProverb;
import com.aloha.teamproject.service.KoreanProverbService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/game/korean-proverbs")
public class KoreanProverbController {

    private final KoreanProverbService koreanProverbService;

    /**
     * 랜덤 속담 조회 (게임용)
     * GET /api/game/korean-proverbs/random?count=10
     */
    @GetMapping("/random")
    public ApiResponse<List<KoreanProverb.GameResponse>> getRandomProverbs(
            @RequestParam(value = "count", defaultValue = "10") int count) {
        try {
            log.info("랜덤 속담 {}개 조회 요청", count);
            List<KoreanProverb> proverbs = koreanProverbService.getRandomProverbs(count);
            
            // DTO 변환: 전체 데이터를 GameResponse로 변환
            List<KoreanProverb.GameResponse> response = proverbs.stream()
                .map(KoreanProverb.GameResponse::from)
                .collect(Collectors.toList());
            
            return ApiResponse.ok(response, SuccessCode.OK);
        } catch (Exception e) {
            log.error("랜덤 속담 조회 실패", e);
            return ApiResponse.error("속담을 불러오지 못했습니다.");
        }
    }

    /**
     * 모든 속담 조회
     * GET /api/game/korean-proverbs
     */
    @GetMapping
    public ApiResponse<List<KoreanProverb.GameResponse>> getAllProverbs() {
        try {
            log.info("모든 속담 조회 요청");
            List<KoreanProverb> proverbs = koreanProverbService.getAllProverbs();
            
            List<KoreanProverb.GameResponse> response = proverbs.stream()
                .map(KoreanProverb.GameResponse::from)
                .collect(Collectors.toList());
            
            return ApiResponse.ok(response, SuccessCode.OK);
        } catch (Exception e) {
            log.error("속담 목록 조회 실패", e);
            return ApiResponse.error("속담을 불러오지 못했습니다.");
        }
    }

    /**
     * 난이도별 속담 조회
     * GET /api/game/korean-proverbs/difficulty/{difficulty}
     */
    @GetMapping("/difficulty/{difficulty}")
    public ApiResponse<List<KoreanProverb.GameResponse>> getProverbsByDifficulty(
            @PathVariable String difficulty) {
        try {
            log.info("난이도 {} 속담 조회 요청", difficulty);
            List<KoreanProverb> proverbs = koreanProverbService.getProverbsByDifficulty(difficulty.toUpperCase());
            
            List<KoreanProverb.GameResponse> response = proverbs.stream()
                .map(KoreanProverb.GameResponse::from)
                .collect(Collectors.toList());
            
            return ApiResponse.ok(response, SuccessCode.OK);
        } catch (Exception e) {
            log.error("난이도별 속담 조회 실패", e);
            return ApiResponse.error("속담을 불러오지 못했습니다.");
        }
    }

    /**
     * ID로 속담 조회
     * GET /api/game/korean-proverbs/{no}
     */
    @GetMapping("/{no}")
    public ApiResponse<KoreanProverb.GameResponse> getProverbById(@PathVariable Integer no) {
        try {
            log.info("속담 ID {} 조회 요청", no);
            KoreanProverb proverb = koreanProverbService.getProverbById(no);
            
            if (proverb == null) {
                return ApiResponse.error("해당 속담을 찾을 수 없습니다.");
            }
            
            return ApiResponse.ok(KoreanProverb.GameResponse.from(proverb), SuccessCode.OK);
        } catch (Exception e) {
            log.error("속담 조회 실패", e);
            return ApiResponse.error("속담을 불러오지 못했습니다.");
        }
    }
}

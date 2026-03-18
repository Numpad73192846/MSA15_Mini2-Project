package com.aloha.teamproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KoreanProverb {
    
    private Integer no;
    private String question;      // 속담 문제 (빈칸 포함)
    private String answer;        // 정답
    private String option1;       // 선택지1
    private String option2;       // 선택지2
    private String option3;       // 선택지3
    private String option4;       // 선택지4
    private String meaning;       // 속담 의미
    private String difficulty;    // 난이도 (EASY, MEDIUM, HARD)
    private Boolean isActive;     // 활성화 여부
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 게임용 응답 DTO
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GameResponse {
        private Integer no;
        private String question;
        private String answer;
        private String[] options;    // 4개의 선택지 배열
        private String meaning;
        private String difficulty;
        
        // KoreanProverb를 GameResponse로 변환하는 정적 메서드
        public static GameResponse from(KoreanProverb proverb) {
            return GameResponse.builder()
                .no(proverb.getNo())
                .question(proverb.getQuestion())
                .answer(proverb.getAnswer())
                .options(new String[]{
                    proverb.getOption1(),
                    proverb.getOption2(),
                    proverb.getOption3(),
                    proverb.getOption4()
                })
                .meaning(proverb.getMeaning())
                .difficulty(proverb.getDifficulty())
                .build();
        }
    }
}

package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.KoreanProverb;

public interface KoreanProverbService {
    
    /**
     * 모든 활성화된 속담 조회
     */
    List<KoreanProverb> getAllProverbs() throws Exception;
    
    /**
     * 난이도별 속담 조회
     * @param difficulty 난이도 (EASY, MEDIUM, HARD)
     */
    List<KoreanProverb> getProverbsByDifficulty(String difficulty) throws Exception;
    
    /**
     * 랜덤으로 N개의 속담 조회 (게임용)
     * @param limit 조회할 개수
     */
    List<KoreanProverb> getRandomProverbs(int limit) throws Exception;
    
    /**
     * ID로 속담 조회
     */
    KoreanProverb getProverbById(Integer no) throws Exception;
}

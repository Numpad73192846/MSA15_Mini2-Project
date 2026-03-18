package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.KoreanProverb;

@Mapper
public interface KoreanProverbMapper {
    
    /**
     * 모든 활성화된 속담 조회
     */
    public List<KoreanProverb> selectAll() throws Exception;
    
    /**
     * 난이도별 속담 조회
     * @param difficulty 난이도 (EASY, MEDIUM, HARD)
     */
    public List<KoreanProverb> selectByDifficulty(@Param("difficulty") String difficulty) throws Exception;
    
    /**
     * 랜덤으로 N개의 속담 조회
     * @param limit 조회할 개수
     */
    public List<KoreanProverb> selectRandomProverbs(@Param("limit") int limit) throws Exception;
    
    /**
     * ID로 속담 조회
     */
    public KoreanProverb selectById(@Param("no") Integer no) throws Exception;
    
    /**
     * 속담 추가
     */
    public int insert(KoreanProverb proverb) throws Exception;
    
    /**
     * 속담 수정
     */
    public int update(KoreanProverb proverb) throws Exception;
    
    /**
     * 속담 삭제 (소프트 삭제 - is_active = 0)
     */
    public int delete(@Param("no") Integer no) throws Exception;
}

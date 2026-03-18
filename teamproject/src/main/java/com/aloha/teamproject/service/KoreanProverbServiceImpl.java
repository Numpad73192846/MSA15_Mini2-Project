package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.dto.KoreanProverb;
import com.aloha.teamproject.mapper.KoreanProverbMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class KoreanProverbServiceImpl implements KoreanProverbService {

    private final KoreanProverbMapper koreanProverbMapper;

    @Override
    public List<KoreanProverb> getAllProverbs() throws Exception {
        log.info("모든 활성화된 속담 조회");
        return koreanProverbMapper.selectAll();
    }

    @Override
    public List<KoreanProverb> getProverbsByDifficulty(String difficulty) throws Exception {
        log.info("난이도별 속담 조회: {}", difficulty);
        return koreanProverbMapper.selectByDifficulty(difficulty);
    }

    @Override
    public List<KoreanProverb> getRandomProverbs(int limit) throws Exception {
        log.info("랜덤 속담 {}개 조회", limit);
        return koreanProverbMapper.selectRandomProverbs(limit);
    }

    @Override
    public KoreanProverb getProverbById(Integer no) throws Exception {
        log.info("속담 조회 ID: {}", no);
        return koreanProverbMapper.selectById(no);
    }
}

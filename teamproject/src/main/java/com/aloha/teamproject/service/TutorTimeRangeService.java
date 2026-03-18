package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.TutorTimeRange;

public interface TutorTimeRangeService {

    /**
     * 튜터의 주간 기본 시간대 조회
     */
    List<TutorTimeRange> selectByUserId(String userId) throws Exception;

    /**
     * 튜터의 기본 시간대 일괄 저장 (기존 삭제 후 재생성)
     */
    boolean replaceTimeRanges(String userId, List<TutorTimeRange> timeRanges) throws Exception;

    /**
     * 기본 시간대 추가
     */
    boolean insert(TutorTimeRange timeRange) throws Exception;

    /**
     * 기본 시간대 삭제
     */
    boolean deleteById(String id) throws Exception;

    /**
     * 기본 시간대 수정
     */
    boolean update(TutorTimeRange timeRange) throws Exception;
}

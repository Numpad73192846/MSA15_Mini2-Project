package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.TutorTimeRange;

@Mapper
public interface TutorTimeRangeMapper {

    /**
     * 튜터의 주간 기본 시간대 조회
     */
    List<TutorTimeRange> selectByUserId(@Param("userId") String userId);

    /**
     * 기본 시간대 추가
     */
    int insert(TutorTimeRange timeRange);

    /**
     * 기본 시간대 일괄 추가
     */
    int insertBatch(@Param("list") List<TutorTimeRange> timeRanges);

    /**
     * 기본 시간대 삭제
     */
    int deleteById(@Param("id") String id);

    /**
     * 튜터의 모든 기본 시간대 삭제
     */
    int deleteByUserId(@Param("userId") String userId);

    /**
     * 기본 시간대 수정
     */
    int update(TutorTimeRange timeRange);
}

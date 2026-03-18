package com.aloha.teamproject.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.TutorAvailability;

@Mapper
public interface TutorAvailabilityMapper {

    /**
     * 튜터의 특정 기간 가용 시간 조회
     */
    List<TutorAvailability> selectByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * ID로 가용시간 단건 조회
     */
    TutorAvailability selectById(@Param("id") String id);

    /**
     * 가용 시간 추가
     */
    int insert(TutorAvailability availability);

    /**
     * 가용 시간 일괄 추가
     */
    int insertBatch(@Param("list") List<TutorAvailability> availabilities);

    /**
     * 가용 시간 상태 변경
     */
    int updateStatus(
            @Param("id") String id,
            @Param("status") String status
    );

    /**
     * 가용 시간의 시작/종료/상태를 함께 변경
     */
    int updateRangeAndStatus(
            @Param("id") String id,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("status") String status
    );

    /**
     * 가용 시간 상태 일괄 변경
     */
    int updateStatusBatch(
            @Param("ids") List<String> ids,
            @Param("status") String status
    );

    /**
     * 가용 시간 삭제
     */
    int deleteById(@Param("id") String id);

    /**
     * 튜터의 특정 기간 가용 시간 모두 삭제
     */
    int deleteOpenWithoutBookingByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

}

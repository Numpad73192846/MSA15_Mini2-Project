package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.TutorMessage;

@Mapper
public interface TutorMessageMapper {

    int insert(TutorMessage tutorMessage) throws Exception;

    int countTutorStudentBookingRelation(
        @Param("tutorId") String tutorId,
        @Param("studentId") String studentId,
        @Param("bookingId") String bookingId
    ) throws Exception;

    int countConfirmedPaidRelation(
        @Param("tutorId") String tutorId,
        @Param("studentId") String studentId,
        @Param("bookingId") String bookingId
    ) throws Exception;

    int countStudentWritableRelation(
        @Param("tutorId") String tutorId,
        @Param("studentId") String studentId,
        @Param("bookingId") String bookingId
    ) throws Exception;

    List<TutorMessage> selectStudentRepliesByTutorId(@Param("tutorId") String tutorId) throws Exception;

    List<TutorMessage> selectThreadByTutorAndStudent(
        @Param("tutorId") String tutorId,
        @Param("studentId") String studentId,
        @Param("bookingId") String bookingId
    ) throws Exception;
}

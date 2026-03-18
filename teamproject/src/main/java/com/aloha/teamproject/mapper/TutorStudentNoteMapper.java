package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.TutorStudentNote;

@Mapper
public interface TutorStudentNoteMapper {

    int upsert(TutorStudentNote tutorStudentNote) throws Exception;

    List<TutorStudentNote> selectByTutorId(@Param("tutorId") String tutorId) throws Exception;

    int countTutorStudentBookingRelation(
        @Param("tutorId") String tutorId,
        @Param("studentId") String studentId
    ) throws Exception;
}

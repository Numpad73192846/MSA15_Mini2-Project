package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.TutorSubject;

@Mapper
public interface TutorSubjectMapper {

    public List<TutorSubject> selectByUserId(String userId) throws Exception;

    public int insert(TutorSubject tutorSubject) throws Exception;

    public int insertBatch(List<TutorSubject> subjects) throws Exception;

    public int deleteByUserId(String userId) throws Exception;

}

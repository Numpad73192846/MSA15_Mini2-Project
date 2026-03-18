package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.TutorEducation;

@Mapper
public interface TutorEducationMapper {

    public List<TutorEducation> selectByUserId(String userId) throws Exception;

    public int insert(TutorEducation tutorEducation) throws Exception;

    public int insertBatch(List<TutorEducation> educations) throws Exception;

    public int deleteByUserId(String userId) throws Exception;

}

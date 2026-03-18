package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.TutorCareer;

@Mapper
public interface TutorCareerMapper {

    public List<TutorCareer> selectByUserId(String userId) throws Exception;

    public int insert(TutorCareer tutorCareer) throws Exception;

    public int insertBatch(List<TutorCareer> careers) throws Exception;

    public int deleteByUserId(String userId) throws Exception;

}

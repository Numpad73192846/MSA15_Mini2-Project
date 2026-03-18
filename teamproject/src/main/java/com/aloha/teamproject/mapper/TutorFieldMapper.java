package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.LanguageField;

@Mapper
public interface TutorFieldMapper {

    int deleteByUserId(String userId);

    int insertBatch(@Param("userId") String userId, @Param("fieldIds") List<String> fieldIds);

    List<LanguageField> selectByUserId(String userId);
}

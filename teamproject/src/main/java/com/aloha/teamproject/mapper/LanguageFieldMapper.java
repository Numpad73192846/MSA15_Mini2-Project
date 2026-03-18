package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.LanguageField;

@Mapper
public interface LanguageFieldMapper {

    List<LanguageField> list();
}

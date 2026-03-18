package com.aloha.teamproject.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.TutorProfile;

@Mapper
public interface TutorProfileMapper {

    int upsertProfile(TutorProfile profile);

    TutorProfile selectByUserId(String userId);
}

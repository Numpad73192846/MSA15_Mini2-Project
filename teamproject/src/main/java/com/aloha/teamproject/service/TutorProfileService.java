package com.aloha.teamproject.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.aloha.teamproject.dto.TutorProfile;

public interface TutorProfileService {

    boolean upsertProfile(TutorProfile profile) throws Exception;

    TutorProfile selectByUserId(String userId) throws Exception;

    // 프로필 이미지
    String saveProfileImg(MultipartFile file) throws IOException;

    // 랜덤 기본 프로필 이미지
    String getRandomProfileImg();
}

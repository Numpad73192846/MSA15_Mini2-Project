package com.aloha.teamproject.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorProfile;
import com.aloha.teamproject.mapper.TutorProfileMapper;
import com.aloha.teamproject.util.YoutubeUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TutorProfileServiceImpl extends BaseServiceImpl implements TutorProfileService {

    private final TutorProfileMapper tutorProfileMapper;
    private final YoutubeUtil youtubeUtil;

    private static final String UPLOAD_DIR = "uploads/tutors/";
    private static final String DEFAULT_PROFILE_DIR = "src/main/resources/static/img/profil";
    private static final Random random = new Random();

    @Override
    public boolean upsertProfile(TutorProfile profile) throws Exception {
        requireNotNull(profile, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(profile.getUserId(), ErrorCode.INVALID_REQUEST);

        // ⭐ 유튜브 URL 변환
        if (profile.getVideoUrl() != null && !profile.getVideoUrl().isBlank()) {
            try {
                profile.setVideoUrl(
                        youtubeUtil.toEmbedUrl(profile.getVideoUrl()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid YouTube URL: {}", profile.getVideoUrl());
                profile.setVideoUrl(null);
            }
        } else {
            profile.setVideoUrl(null);
        }

        int result = tutorProfileMapper.upsertProfile(profile);
        if (result <= 0) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
        return true;
    }

    @Override
    public TutorProfile selectByUserId(String userId) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        return tutorProfileMapper.selectByUserId(userId);
    }

    @Override
    public String saveProfileImg(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalName = file.getOriginalFilename();
        String ext = FilenameUtils.getExtension(originalName);
        String fileName = UUID.randomUUID() + "." + ext;

        Path path = Paths.get(UPLOAD_DIR + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        log.debug("프로필 이미지 저장 완료: {}", path);

        return "/uploads/tutors/" + fileName;
    }

    /**
     * 프로필 폴더에서 랜덤한 기본 이미지를 선택하여 반환합니다.
     * 
     * @return 랜덤하게 선택된 프로필 이미지 경로 (예: /img/profil/bear.svg)
     */
    @Override
    public String getRandomProfileImg() {
        try {
            Path profileDir = Paths.get(DEFAULT_PROFILE_DIR);

            // 프로필 폴더의 모든 파일 목록 가져오기
            List<Path> imageFiles = Files.list(profileDir)
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        String fileName = path.getFileName().toString().toLowerCase();
                        return fileName.endsWith(".svg") ||
                                fileName.endsWith(".png") ||
                                fileName.endsWith(".jpg") ||
                                fileName.endsWith(".jpeg");
                    })
                    .collect(Collectors.toList());

            if (imageFiles.isEmpty()) {
                log.warn("프로필 폴더에 이미지가 없습니다. 기본값을 반환합니다.");
                return "/img/profil/bear.svg"; // 기본값
            }

            // 랜덤하게 하나 선택
            Path selectedImage = imageFiles.get(random.nextInt(imageFiles.size()));
            String imageName = selectedImage.getFileName().toString();

            log.debug("랜덤 프로필 이미지 선택: {}", imageName);
            return "/img/profil/" + imageName;

        } catch (IOException e) {
            log.error("랜덤 프로필 이미지 선택 실패", e);
            return "/img/profil/bear.svg"; // 오류 시 기본값 반환
        }
    }

}

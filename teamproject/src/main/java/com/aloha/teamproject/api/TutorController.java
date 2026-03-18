package com.aloha.teamproject.api;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.io.FilenameUtils;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.Lesson;
import com.aloha.teamproject.dto.LessonCardItem;
import com.aloha.teamproject.dto.Subject;
import com.aloha.teamproject.dto.TutorCareer;
import com.aloha.teamproject.dto.TutorDocument;
import com.aloha.teamproject.dto.TutorEducation;
import com.aloha.teamproject.dto.TutorList;
import com.aloha.teamproject.dto.TutorMyPage;
import com.aloha.teamproject.dto.TutorProfile;
import com.aloha.teamproject.dto.UserAuth;
import com.aloha.teamproject.service.LessonService;
import com.aloha.teamproject.service.SubjectService;
import com.aloha.teamproject.service.TutorCareerService;
import com.aloha.teamproject.service.TutorDocumentService;
import com.aloha.teamproject.service.TutorEducationService;
import com.aloha.teamproject.service.TutorFieldService;
import com.aloha.teamproject.service.TutorListService;
import com.aloha.teamproject.service.TutorMyPageService;
import com.aloha.teamproject.service.TutorProfileService;
import com.aloha.teamproject.service.TutorSubjectService;
import com.aloha.teamproject.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tutors")
public class TutorController {

    private final PasswordEncoder passwordEncoder;

    private final TutorProfileService tutorProfileService;
    private final TutorDocumentService tutorDocumentService;
    private final TutorFieldService tutorFieldService;
    private final TutorMyPageService tutorMyPageService;
    private final TutorCareerService tutorCareerService;
    private final TutorListService tutorListService;
    private final TutorSubjectService tutorSubjectService;
    private final TutorEducationService tutorEducationService;
    private final UserService userService;
    private final SubjectService subjectService;
    private final LessonService lessonService;
    private final ObjectMapper objectMapper;

    private static final String DOC_UPLOAD_DIR = "uploads/tutors/documents/";

    @Data
    public static class CertificateTextItem {
        private String name;
        private String issuer;
    }

    @GetMapping("/me")
    public ApiResponse<TutorMyPage> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = authentication.getName();

            TutorMyPage tutorMyPage = new TutorMyPage();
            tutorMyPage.setTutorProfile(tutorMyPageService.selectTutorProfileByUserId(userId));
            tutorMyPage.setLanguageFields(tutorMyPageService.selectTutorFieldsByUserId(userId));
            tutorMyPage.setTutorStats(tutorMyPageService.selectTutorStatsByUserId(userId));
            tutorMyPage.setUpcomingLessons(tutorMyPageService.selectUpcomingBookingsByUserId(userId));
            tutorMyPage.setPastLessons(tutorMyPageService.selectPastBookingsByUserId(userId));
            tutorMyPage.setTutorReviews(tutorMyPageService.selectTutorReviewsByUserId(userId));
            tutorMyPage.setMonthlyEarnings(tutorMyPageService.selectMonthlyEarningsByUserId(userId));

            return ApiResponse.ok(tutorMyPage);
        } catch (Exception e) {
            log.error("/api/tutors/me 조회 실패", e);
            return ApiResponse.error("튜터 정보를 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detail(@org.springframework.web.bind.annotation.PathVariable("id") String id,
            Authentication authentication) {
        try {
            TutorList tutor = tutorListService.selectTutorById(id);
            if (tutor == null) {
                return ApiResponse.error("튜터를 찾을 수 없습니다.");
            }

            List<TutorDocument> documents = tutorDocumentService.selectByUserId(tutor.getUserId());
            boolean educationApproved = hasApprovedDocument(documents, "EDUCATION");
            boolean degreeApproved = hasApprovedDocument(documents, "DEGREE");
            boolean certificateApproved = hasApprovedDocument(documents, "CERTIFICATE")
                    || hasApprovedDocument(documents, "CERTIFICATE_TEXT");

            if (!educationApproved) {
                tutor.setEducationSchools("");
                tutor.setEducationDocuments("");
            }
            if (!degreeApproved) {
                tutor.setEducationDegrees("");
                tutor.setDegreeDocuments("");
            }
            if (!(educationApproved && degreeApproved)) {
                tutor.setEducationTimeline("");
            }
            if (!certificateApproved) {
                tutor.setCertificates("");
            }

            Map<String, Object> result = new HashMap<>();
            result.put("tutor", tutor);
            result.put("canBook", !hasTutorAuthority(authentication));
            return ApiResponse.ok(result);
        } catch (Exception e) {
            log.error("튜터 상세 조회 실패", e);
            return ApiResponse.error("튜터 상세 정보를 조회하지 못했습니다.");
        }
    }

    @PostMapping("/subjects")
    public ApiResponse<Void> subjects(@RequestBody String entity) {
        // TODO: 튜터 과목 관리 - 추후 구현 예정
        return ApiResponse.error("이 기능은 아직 구현 중입니다.");
    }

    @GetMapping("/careers")
    public ApiResponse<List<TutorCareer>> myCareers(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            List<TutorCareer> careers = tutorCareerService.selectByUserId(authentication.getName());
            return ApiResponse.ok(careers);
        } catch (Exception e) {
            log.error("/api/tutors/careers 조회 실패", e);
            return ApiResponse.error("경력을 가져오지 못했습니다.");
        }
    }

    @PostMapping("/careers")
    public ApiResponse<Void> careers(
            Authentication authentication,
            @RequestBody List<TutorCareer.Request.CareerItem> items) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            tutorCareerService.replaceCareers(authentication.getName(), items);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("/api/tutors/careers 저장 실패", e);
            return ApiResponse.error("경력 저장에 실패했습니다.");
        }

    }

    @GetMapping("/educations")
    public ApiResponse<List<TutorEducation>> myEducations(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            List<TutorEducation> educations = tutorEducationService.selectByUserId(authentication.getName());
            return ApiResponse.ok(educations);
        } catch (Exception e) {
            log.error("/api/tutors/educations 조회 실패", e);
            return ApiResponse.error("학력 목록을 가져오지 못했습니다.");
        }
    }

    @PostMapping("/educations")
    public ApiResponse<Void> educations(
            Authentication authentication,
            @RequestBody List<TutorEducation.Request.EducationItem> items) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            tutorEducationService.replaceEducations(authentication.getName(), items);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("/api/tutors/educations 저장 실패", e);
            return ApiResponse.error("학력 저장에 실패했습니다.");
        }
    }

    @PostMapping("/time-ranges")
    public ApiResponse<Void> timeRanges(@RequestBody String entity) {
        // TODO: 시간대 관리는 /api/tutors/me/time-ranges에서 처리
        return ApiResponse.error("시간대 관리는 /api/tutors/me/time-ranges를 사용해주세요.");
    }

    @GetMapping("/documents")
    public ApiResponse<List<TutorDocument>> myDocuments(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            List<TutorDocument> docs = tutorDocumentService.selectByUserId(authentication.getName());
            return ApiResponse.ok(docs);
        } catch (Exception e) {
            log.error("/api/tutors/documents 조회 실패", e);
            return ApiResponse.error("서류 목록을 가져오지 못했습니다.");
        }
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> uploadDocument(
            Authentication authentication,
            @RequestParam("docType") String docType,
            @RequestParam("file") MultipartFile file) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }
        if (file == null || file.isEmpty()) {
            return ApiResponse.error("업로드할 파일이 없습니다.");
        }

        Set<String> allowed = Set.of("EDUCATION", "DEGREE", "CERTIFICATE");
        if (!allowed.contains(docType)) {
            return ApiResponse.error("허용되지 않는 서류 유형입니다.");
        }

        try {
            String originalName = file.getOriginalFilename();
            String ext = FilenameUtils.getExtension(originalName);
            String storeName = UUID.randomUUID() + (ext != null && !ext.isBlank() ? "." + ext : "");
            Path path = Paths.get(DOC_UPLOAD_DIR + storeName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            TutorDocument doc = TutorDocument.builder()
                    .userId(authentication.getName())
                    .docType(docType)
                    .fileSize((int) file.getSize())
                    .originalName(originalName)
                    .storeName(storeName)
                    .filePath("/uploads/tutors/documents/" + storeName)
                    .contentType(file.getContentType())
                    .build();

            tutorDocumentService.insert(doc);
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("/api/tutors/documents 업로드 실패", e);
            return ApiResponse.error("서류 업로드에 실패했습니다.");
        }
    }

    @PutMapping("/documents/certificate-texts")
    public ApiResponse<Void> updateCertificateTexts(
            Authentication authentication,
            @RequestBody(required = false) List<CertificateTextItem> items) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = resolveUserId(authentication.getName());
            if (!StringUtils.hasText(userId)) {
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            String payload = objectMapper.writeValueAsString(items == null ? Collections.emptyList() : items);
            replaceCertificateTextDocuments(userId, payload);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("/api/tutors/documents/certificate-texts 저장 실패", e);
            return ApiResponse.error("자격증 텍스트 저장에 실패했습니다.");
        }
    }

    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> profile(
            @ModelAttribute TutorProfile.Request request,
            Authentication authentication) throws Exception {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }
        try {
            String authName = authentication.getName();
            String userId = resolveUserId(authName);
            if (!StringUtils.hasText(userId)) {
                log.error("/api/tutors/profile userId resolve failed. authName={}", authName);
                return ApiResponse.error("사용자 정보를 확인하지 못했습니다.");
            }

            // 프로필 이미지 처리: 업로드된 이미지가 있으면 저장, 없으면 랜덤 이미지 할당
            String profileImgPath = null;
            if (request.getProfileImg() != null && !request.getProfileImg().isEmpty()) {
                profileImgPath = tutorProfileService.saveProfileImg(request.getProfileImg());
                userService.updateProfileImg(userId, profileImgPath);
            } else {
                // 프로필 이미지가 업로드되지 않은 경우 랜덤 이미지 할당
                profileImgPath = tutorProfileService.getRandomProfileImg();
                userService.updateProfileImg(userId, profileImgPath);
                log.info("랜덤 프로필 이미지 할당: {}", profileImgPath);
            }

            TutorProfile profile = TutorProfile.builder()
                    .userId(userId)
                    .phone(request.getBasicPhone())
                    .bankName(request.getBasicBankName())
                    .accountNumber(request.getBasicAccountNumber())
                    .accountHolder(request.getBasicAccountHolder())
                    .headline(request.getHeadline())
                    .bio(request.getBio())
                    .selfIntro(request.getSelfIntro())
                    .videoUrl(request.getVideoUrl())
                    .build();

            List<LessonCardItem> lessonCards;
            if (!StringUtils.hasText(request.getLessonCardsJson())) {
                lessonCards = Collections.emptyList();
            } else {
                lessonCards = Arrays.asList(objectMapper.readValue(
                        request.getLessonCardsJson(),
                        LessonCardItem[].class));
            }

            Set<String> subjectIds = new java.util.HashSet<>();
            for (LessonCardItem card : lessonCards) {
                Subject subject = subjectService.selectByName(card.getSubject());
                if (subject != null) {
                    Lesson lesson = Lesson.builder()
                            .userId(userId)
                            .title(card.getSubject() + "-" + card.getField())
                            .price(card.getPrice())
                            .fieldId(card.getFieldId())
                            .subjectId(subject.getId())
                            .build();
                    lessonService.insert(lesson);
                    subjectIds.add(subject.getId());
                }
            }
            if (!subjectIds.isEmpty()) {
                tutorSubjectService.replaceSubjects(userId, new java.util.ArrayList<>(subjectIds));
            }

            List<TutorCareer.Request.CareerItem> careers;
            if (!StringUtils.hasText(request.getCareersJson())) {
                careers = Collections.emptyList();
            } else {
                careers = Arrays.asList(objectMapper.readValue(
                        request.getCareersJson(),
                        TutorCareer.Request.CareerItem[].class));
            }
            List<TutorEducation.Request.EducationItem> educations = buildEducationItems(
                    request.getEducationsJson(),
                    request.getDegreesJson());

            tutorProfileService.upsertProfile(profile);
            tutorFieldService.replaceFields(userId, request.getFieldIds());
            tutorCareerService.replaceCareers(userId, careers);
            tutorEducationService.replaceEducations(userId, educations);
            userService.deleteAuth(userId, "ROLE_TUTOR_PENDING");
            userService.insertAuth(UserAuth.builder()
                    .userId(userId)
                    .auth("ROLE_TUTOR")
                    .build());

            log.info("튜터 프로필 저장 완료. 연락처: {}", request.getBasicPhone());
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("/api/tutors/profile 저장 실패", e);
            return ApiResponse.error("튜터 정보를 저장하지 못했습니다.");
        }
    }

    private List<TutorEducation.Request.EducationItem> buildEducationItems(String educationsJson, String degreesJson)
            throws Exception {
        JsonNode educationsNode = StringUtils.hasText(educationsJson) ? objectMapper.readTree(educationsJson)
                : objectMapper.createArrayNode();
        JsonNode degreesNode = StringUtils.hasText(degreesJson) ? objectMapper.readTree(degreesJson)
                : objectMapper.createArrayNode();

        int educationSize = educationsNode != null && educationsNode.isArray() ? educationsNode.size() : 0;
        int degreeSize = degreesNode != null && degreesNode.isArray() ? degreesNode.size() : 0;
        int maxSize = Math.max(educationSize, degreeSize);
        if (maxSize == 0) {
            return Collections.emptyList();
        }

        List<TutorEducation.Request.EducationItem> items = new ArrayList<>();
        for (int i = 0; i < maxSize; i++) {
            JsonNode eduNode = (educationsNode != null && i < educationSize) ? educationsNode.get(i) : null;
            JsonNode degreeNode = (degreesNode != null && i < degreeSize) ? degreesNode.get(i) : null;

            String schoolName = textOrNull(eduNode, "schoolName");
            Integer startYear = intOrNull(eduNode, "startYear");
            Integer graduatedYear = intOrNull(eduNode, "graduatedYear");

            String degreeName = textOrNull(degreeNode, "degreeName");
            String major = textOrNull(degreeNode, "major");
            String degree = degreeName;
            if (StringUtils.hasText(degreeName) && StringUtils.hasText(major)) {
                degree = degreeName + " (" + major + ")";
            } else if (!StringUtils.hasText(degreeName) && StringUtils.hasText(major)) {
                degree = major;
            }

            if (!StringUtils.hasText(schoolName) && !StringUtils.hasText(degree)) {
                continue;
            }
            if (!StringUtils.hasText(schoolName)) {
                schoolName = "학위 정보";
            }
            if (!StringUtils.hasText(degree)) {
                degree = "학위 미기입력";
            }
            if (startYear == null) {
                startYear = graduatedYear != null ? graduatedYear : LocalDate.now().getYear();
            }

            items.add(new TutorEducation.Request.EducationItem(
                    schoolName,
                    degree,
                    startYear,
                    graduatedYear));
        }
        return items;
    }

    private String textOrNull(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return null;
        }
        String value = node.get(field).asText();
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private Integer intOrNull(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return null;
        }
        JsonNode valueNode = node.get(field);
        if (valueNode.isInt() || valueNode.isLong()) {
            return valueNode.asInt();
        }
        String text = valueNode.asText();
        if (!StringUtils.hasText(text)) {
            return null;
        }
        try {
            return Integer.parseInt(text.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private void replaceCertificateTextDocuments(String userId, String certificateTextsJson) throws Exception {
        tutorDocumentService.deleteByUserIdAndDocType(userId, "CERTIFICATE_TEXT");
        if (!StringUtils.hasText(certificateTextsJson)) {
            return;
        }

        JsonNode root = objectMapper.readTree(certificateTextsJson);
        if (root == null || !root.isArray()) {
            return;
        }

        for (JsonNode node : root) {
            String name = textOrNull(node, "name");
            String issuer = textOrNull(node, "issuer");
            if (!StringUtils.hasText(name)) {
                continue;
            }

            String displayName = StringUtils.hasText(issuer)
                    ? name + " (" + issuer + ")"
                    : name;

            String virtualName = "certificate-text-" + UUID.randomUUID() + ".txt";
            TutorDocument doc = TutorDocument.builder()
                    .userId(userId)
                    .docType("CERTIFICATE_TEXT")
                    .fileSize(0)
                    .originalName(displayName)
                    .storeName(virtualName)
                    .filePath("/uploads/tutors/documents/" + virtualName)
                    .contentType("text/plain")
                    .build();

            tutorDocumentService.insert(doc);
        }
    }

    private String resolveUserId(String authName) {
        if (!StringUtils.hasText(authName)) {
            return null;
        }
        try {
            return userService.selectById(authName).getId();
        } catch (Exception ignored) {
            // fall through
        }
        try {
            return userService.selectByUsername(authName).getId();
        } catch (Exception ignored) {
            return null;
        }
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> updateTutorProfile(
            Authentication authentication,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "passwordConfirm", required = false) String passwordConfirm,
            @RequestParam(value = "headline", required = false) String headline,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "selfIntro", required = false) String selfIntro,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "defaultZoomUrl", required = false) String defaultZoomUrl,
            @RequestParam(value = "bankName", required = false) String bankName,
            @RequestParam(value = "accountNumber", required = false) String accountNumber,
            @RequestParam(value = "accountHolder", required = false) String accountHolder,
            @RequestParam(value = "profileImg", required = false) MultipartFile profileImg) throws Exception {

        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("인증 실패");
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = authentication.getName();
            var user = userService.selectById(userId);

            // 1️⃣ Users 정보 수정: 비밀번호 여부에 따라 처리
            if (password != null && !password.isBlank()) {
                // 새 비밀번호가 현재 비밀번호와 같은지 확인
                if (passwordEncoder.matches(password, user.getPassword())) {
                    return ApiResponse.error("현재 비밀번호와 같습니다");
                }
                // 비밀번호 변경: updateMyInfo 사용 (이름도 포함)
                userService.updateMyInfo(userId, name, password, passwordConfirm);
                log.info("튜터 비밀번호 업데이트 완료. userId: {}", userId);
            } else {
                // 비밀번호 변경 없이 기본 정보만 수정
                if (name != null && !name.isBlank()) {
                    user.setName(name);
                    user.setPassword(null); // 🔥 기존 비밀번호 재인코딩 방지
                    userService.update(user);
                    log.info("튜터 정보 업데이트 완료. userId: {}", userId);
                }
            }

            // 2️⃣ TutorProfile 정보 수정
            TutorProfile profile = tutorProfileService.selectByUserId(userId);
            if (profile == null) {
                profile = new TutorProfile();
                profile.setUserId(userId);
            }

            // 전달된 값만 덮어쓰기, null은 기존 값 유지
            if (headline != null) profile.setHeadline(headline);
            if (bio != null) profile.setBio(bio);
            if (selfIntro != null) profile.setSelfIntro(selfIntro);
            if (videoUrl != null) profile.setVideoUrl(videoUrl);
            if (defaultZoomUrl != null) profile.setDefaultZoomUrl(defaultZoomUrl);
            if (phone != null) profile.setPhone(phone);
            if (bankName != null) profile.setBankName(bankName);
            if (accountNumber != null) profile.setAccountNumber(accountNumber);
            if (accountHolder != null) profile.setAccountHolder(accountHolder);

            // 프로필 이미지 처리
            if (profileImg != null && !profileImg.isEmpty()) {
                String imgPath = tutorProfileService.saveProfileImg(profileImg);
                userService.updateProfileImg(userId, imgPath);
                log.info("프로필 이미지 저장 완료: {}", imgPath);
            }
            // 참고: 프로필 수정 시에는 기존 이미지를 유지하므로 랜덤 이미지를 할당하지 않습니다.

            tutorProfileService.upsertProfile(profile);
            log.info("TutorProfile 업데이트 완료. userId: {}", userId);

            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("튜터 프로필 수정 실패", e);
            return ApiResponse.error("프로필 수정에 실패했습니다.");
        }
    }

    @GetMapping()
    public ApiResponse<List<TutorList>> searchTutors(
            @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam(value = "subjects", required = false) String subjects,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice) {

        try {
            List<TutorList> tutors;

            if (StringUtils.hasText(searchTerm)) {
                tutors = tutorListService.selectTutorsBySearchTerm(searchTerm);
            } else {
                tutors = tutorListService.selectAllTutors();
            }

            if (StringUtils.hasText(language) && !"all".equals(language)) {
                final String lang = language.trim();
                tutors = tutors.stream()
                        .filter(tutor -> tutor.getSubjects() != null && tutor.getSubjects().contains(lang))
                        .collect(Collectors.toList());
            }

            if (StringUtils.hasText(subjects)) {
                List<String> subjectList = Arrays.stream(subjects.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
                if (!subjectList.isEmpty()) {
                    tutors = tutors.stream()
                            .filter(tutor -> {
                                if (tutor.getSubjects() == null) {
                                    return false;
                                }
                                return subjectList.stream()
                                        .anyMatch(subject -> tutor.getSubjects().contains(subject));
                            })
                            .collect(Collectors.toList());
                }
            }

            if (minPrice != null || maxPrice != null) {
                final BigDecimal min = (minPrice != null) ? minPrice : BigDecimal.ZERO;
                final BigDecimal max = (maxPrice != null) ? maxPrice : BigDecimal.valueOf(Double.MAX_VALUE);

                tutors = tutors.stream()
                        .filter(tutor -> {
                            if (tutor.getPrice() == null) {
                                return false;
                            }
                            return tutor.getPrice().compareTo(min) >= 0 && tutor.getPrice().compareTo(max) <= 0;
                        })
                        .collect(Collectors.toList());
            }
            return ApiResponse.ok(tutors);

        } catch (Exception e) {
            return ApiResponse.error("튜터 목록을 조회할 수 없습니다.");
        }
    }

    private boolean hasApprovedDocument(List<TutorDocument> docs, String docType) {
        if (!StringUtils.hasText(docType) || docs == null || docs.isEmpty()) {
            return false;
        }
        return docs.stream()
                .filter(Objects::nonNull)
                .filter(doc -> docType.equalsIgnoreCase(doc.getDocType()))
                .anyMatch(doc -> doc.getReviewedAt() != null && !StringUtils.hasText(doc.getRejectReason()));
    }

    private boolean hasTutorAuthority(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_TUTOR")
                        || authority.getAuthority().equals("ROLE_TUTOR_PENDING")
                        || authority.getAuthority().equals("ROLE_ADMIN"));
    }

}

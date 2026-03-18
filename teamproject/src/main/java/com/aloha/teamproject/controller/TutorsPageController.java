package com.aloha.teamproject.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.util.StringUtils;

import com.aloha.teamproject.dto.Review;
import com.aloha.teamproject.dto.TutorDocument;
import com.aloha.teamproject.dto.TutorList;
import com.aloha.teamproject.dto.TutorMessage;
import com.aloha.teamproject.dto.TutorStudentNote;
import com.aloha.teamproject.dto.UpcomingLesson;
import com.aloha.teamproject.service.ReviewService;
import com.aloha.teamproject.service.TutorDocumentService;
import com.aloha.teamproject.service.TutorMessageService;
import com.aloha.teamproject.service.TutorListService;
import com.aloha.teamproject.service.TutorMyPageService;
import com.aloha.teamproject.service.TutorStudentNoteService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class TutorsPageController {

    private final TutorListService tutorListService;
    private final ReviewService reviewService;
    private final TutorDocumentService tutorDocumentService;
    private final TutorMyPageService tutorMyPageService;
    private final TutorStudentNoteService tutorStudentNoteService;
    private final TutorMessageService tutorMessageService;

    @GetMapping("/tutors")
    public String tutors(Authentication authentication, Model model) {
        try {
            List<TutorList> tutors = tutorListService.selectAllTutors();

            for (TutorList tutor : tutors) {
                List<Review> reviews = reviewService.selectReviewsByTutor(tutor.getUserId());

                double avgRating = 0.0;
                if (!reviews.isEmpty()) {
                    avgRating = reviews.stream()
                            .mapToInt(Review::getRating)
                            .average()
                            .orElse(0.0);
                }

                tutor.setRatingAvg(BigDecimal.valueOf(Math.round(avgRating * 10.0) / 10.0));
                tutor.setReviewCount(reviews.size());
            }

            model.addAttribute("tutors", tutors);
        } catch (Exception e) {
            log.error("튜터 목록 조회 실패", e);
        }
        return "tutors/list";
    }

    @GetMapping("/tutors/{id}")
    public String tutorDetail(@PathVariable("id") String id, Model model, Authentication authentication) {
        boolean isTutorViewer = hasTutorAuthority(authentication);
        model.addAttribute("isTutorViewer", isTutorViewer);
        model.addAttribute("canBook", !isTutorViewer);

        try {
            TutorList tutor = tutorListService.selectTutorById(id);
            if (tutor == null) {
                return "redirect:/tutors";
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

            Map<String, Object> tutorMap = new HashMap<>();
            tutorMap.put("userId", tutor.getUserId());
            tutorMap.put("name", tutor.getName() != null ? tutor.getName() : "");
            tutorMap.put("nickname", tutor.getNickname() != null ? tutor.getNickname() : "");
            tutorMap.put("profileImg", tutor.getProfileImg() != null ? tutor.getProfileImg() : "");
            tutorMap.put("ratingAvg", tutor.getRatingAvg() != null ? tutor.getRatingAvg() : 0.0);
            tutorMap.put("reviewCount", tutor.getReviewCount() != null ? tutor.getReviewCount() : 0);
            tutorMap.put("subjects", tutor.getSubjects() != null ? tutor.getSubjects() : "");
            tutorMap.put("bio", tutor.getBio() != null ? tutor.getBio() : "");
            tutorMap.put("selfIntro", tutor.getSelfIntro() != null ? tutor.getSelfIntro() : "");
            tutorMap.put("videoUrl", tutor.getVideoUrl() != null ? tutor.getVideoUrl() : "");
            tutorMap.put("experience", tutor.getExperience() != null ? tutor.getExperience() : "");
            tutorMap.put("careerTimeline", tutor.getCareerTimeline() != null ? tutor.getCareerTimeline() : "");
            tutorMap.put("careerTimelineItems", toTimelineItems(tutor.getCareerTimeline()));
            tutorMap.put("educationSchools", tutor.getEducationSchools() != null ? tutor.getEducationSchools() : "");
            tutorMap.put("educationDegrees", tutor.getEducationDegrees() != null ? tutor.getEducationDegrees() : "");
            tutorMap.put("educationTimeline", tutor.getEducationTimeline() != null ? tutor.getEducationTimeline() : "");
            tutorMap.put("educationTimelineItems", toTimelineItems(tutor.getEducationTimeline()));
            tutorMap.put("educationDocuments", tutor.getEducationDocuments() != null ? tutor.getEducationDocuments() : "");
            tutorMap.put("degreeDocuments", tutor.getDegreeDocuments() != null ? tutor.getDegreeDocuments() : "");
            tutorMap.put("certificates", tutor.getCertificates() != null ? tutor.getCertificates() : "");
            tutorMap.put("price", tutor.getPrice() != null ? tutor.getPrice() : 0);
            tutorMap.put("availability", "평일 저녁, 주말");

            List<Review> reviews = reviewService.selectReviewsByTutor(tutor.getUserId());

            log.info("튜터 비디오 URL: {}", tutor.getVideoUrl());

            double avgRating = 0.0;
            if (!reviews.isEmpty()) {
                avgRating = reviews.stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);
            }

            model.addAttribute("tutor", tutorMap);
            model.addAttribute("reviews", reviews);
            model.addAttribute("avgRating", BigDecimal.valueOf(Math.round(avgRating * 10.0) / 10.0));
            model.addAttribute("reviewCount", reviews.size());
        } catch (Exception e) {
            log.error("튜터 상세 조회 실패", e);
        }
        return "tutors/detail";
    }

    private boolean hasApprovedDocument(List<TutorDocument> docs, String docType) {
        if (!StringUtils.hasText(docType) || docs == null || docs.isEmpty()) {
            return false;
        }
        return docs.stream()
                .filter(Objects::nonNull)
                .filter(doc -> docType.equalsIgnoreCase(doc.getDocType()))
                .anyMatch(doc -> doc.getReviewedAt() != null
                        && !StringUtils.hasText(doc.getRejectReason()));
    }

    private boolean hasTutorAuthority(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> {
                    String role = authority.getAuthority();
                    return "ROLE_TUTOR".equals(role) || "ROLE_TUTOR_PENDING".equals(role);
                });
    }

    @GetMapping("/tutor/dashboard")
    public String tutorDashboard(Model model, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }

        try {
            String userId = authentication.getName();
            LocalDateTime now = LocalDateTime.now();

            List<UpcomingLesson> upcomingLessons = tutorMyPageService.selectUpcomingBookingsByUserId(userId);
            List<UpcomingLesson> pastLessons = tutorMyPageService.selectPastBookingsByUserId(userId);
            List<TutorStudentNote> studentNotes = tutorStudentNoteService.selectByTutorId(userId);
            List<TutorMessage> studentReplies = tutorMessageService.selectStudentRepliesByTutorId(userId);

            Map<String, TutorStudentNote> noteMap = new HashMap<>();
            for (TutorStudentNote note : studentNotes) {
                noteMap.put(note.getStudentId(), note);
            }

            Map<String, UpcomingLesson> lessonMap = new LinkedHashMap<>();
            for (UpcomingLesson lesson : upcomingLessons) {
                lessonMap.put(lesson.getBookingId(), lesson);
            }
            for (UpcomingLesson lesson : pastLessons) {
                if ("CONFIRMED".equals(lesson.getStatus())) {
                    lessonMap.putIfAbsent(lesson.getBookingId(), lesson);
                }
            }

            List<UpcomingLesson> dashboardLessons = lessonMap.values().stream()
                    .sorted(Comparator.comparing(UpcomingLesson::getStartAt,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();

            List<Map<String, Object>> bookings = dashboardLessons.stream().map(lesson -> {
                Map<String, Object> map = new HashMap<>();
                boolean paid = lesson.getPaidAt() != null;
                boolean canComplete = "CONFIRMED".equals(lesson.getStatus())
                        && paid
                        && lesson.getEndAt() != null
                        && !lesson.getEndAt().isAfter(now);

                map.put("id", lesson.getBookingId());
                map.put("studentId", lesson.getStudentId());
                map.put("studentName", lesson.getStudentName());
                map.put("subject", lesson.getSubject());
                map.put("status", toDashboardStatus(lesson.getStatus(), paid));
                map.put("statusClass", toDashboardStatusClass(lesson.getStatus(), paid));
                map.put("actionState", toActionState(lesson.getStatus(), paid, canComplete));
                map.put("canComplete", canComplete);
                map.put("paid", paid);
                map.put("date", lesson.getLessonDate());
                map.put("time", lesson.getStartTime());
                map.put("duration", lesson.getDurationHours());
                map.put("totalPrice", lesson.getPrice() != null ? lesson.getPrice().intValue() : 0);
                return map;
            }).toList();

            Map<String, Map<String, Object>> studentMap = new LinkedHashMap<>();
            for (UpcomingLesson lesson : dashboardLessons) {
                String studentId = lesson.getStudentId();
                if (!studentMap.containsKey(studentId)) {
                    Map<String, Object> student = new HashMap<>();
                    TutorStudentNote note = noteMap.get(studentId);
                    student.put("id", studentId);
                    student.put("name", lesson.getStudentName());
                    student.put("email", "");
                    student.put("phone", "");
                    student.put("subjects", new java.util.ArrayList<String>());
                    student.put("totalSessions", 0);
                    student.put("lastSession", lesson.getLessonDate());
                    student.put("progress", note != null && note.getProgress() != null ? note.getProgress() : "");
                    student.put("notes", note != null && note.getNotes() != null ? note.getNotes() : "");
                    studentMap.put(studentId, student);
                }
                @SuppressWarnings("unchecked")
                List<String> subjects = (List<String>) studentMap.get(studentId).get("subjects");
                if (!subjects.contains(lesson.getSubject())) {
                    subjects.add(lesson.getSubject());
                }
                studentMap.get(studentId).put(
                        "totalSessions",
                        (Integer) studentMap.get(studentId).get("totalSessions") + 1);
            }

            model.addAttribute("bookings", bookings);
            model.addAttribute("students", new java.util.ArrayList<>(studentMap.values()));
            model.addAttribute("studentReplies", studentReplies);
        } catch (Exception e) {
            log.error("튜터 대시보드 데이터 조회 실패", e);
            model.addAttribute("bookings", List.of());
            model.addAttribute("students", List.of());
            model.addAttribute("studentReplies", List.of());
        }

        return "tutor/dashboard";
    }

    private String toDashboardStatus(String status, boolean paid) {
        if ("PENDING".equals(status)) {
            return "대기중";
        }
        if ("CONFIRMED".equals(status)) {
            return paid ? "결제완료" : "결제대기";
        }
        if ("COMPLETED".equals(status)) {
            return "수업완료";
        }
        if ("CANCELLED".equals(status)) {
            return "취소";
        }
        return status == null ? "" : status;
    }

    private List<Map<String, String>> toTimelineItems(String timelineRaw) {
        List<Map<String, String>> items = new ArrayList<>();
        if (timelineRaw == null || timelineRaw.isBlank()) {
            return items;
        }

        String[] timelineRows = timelineRaw.split("\\s*\\|\\|\\|\\s*");
        for (String row : timelineRows) {
            if (row == null || row.isBlank()) {
                continue;
            }

            String[] parts = row.split(":::", 2);
            String year = parts.length > 0 ? parts[0].trim() : "";
            String text = parts.length > 1 ? parts[1].trim() : "";

            if (year.isEmpty() && text.isEmpty()) {
                continue;
            }

            Map<String, String> item = new HashMap<>();
            item.put("year", year);
            item.put("text", text);
            items.add(item);
        }

        return items;
    }

    private String toDashboardStatusClass(String status, boolean paid) {
        if ("PENDING".equals(status)) {
            return "bg-warning text-dark";
        }
        if ("CONFIRMED".equals(status)) {
            return paid ? "bg-success" : "bg-secondary";
        }
        if ("COMPLETED".equals(status)) {
            return "bg-primary";
        }
        if ("CANCELLED".equals(status)) {
            return "bg-danger";
        }
        return "bg-secondary";
    }

    private String toActionState(String status, boolean paid, boolean canComplete) {
        if ("PENDING".equals(status)) {
            return "PENDING";
        }
        if ("CONFIRMED".equals(status)) {
            if (!paid) {
                return "WAITING_PAYMENT";
            }
            return canComplete ? "COMPLETE_AVAILABLE" : "PAID";
        }
        if ("COMPLETED".equals(status)) {
            return "COMPLETED";
        }
        if ("CANCELLED".equals(status)) {
            return "CANCELLED";
        }
        return "NONE";
    }

    @GetMapping("/tutor/register")
    public String tutorRegister() {
        return "tutor/register";
    }

    @GetMapping("/tutor/register1")
    public String tutorRegister1() {
        return "tutor/register1";
    }

    @GetMapping("/tutor/register2")
    public String tutorRegister2() {
        return "tutor/register2";
    }

    @GetMapping("/tutor/register3")
    public String tutorRegister3() {
        return "tutor/register3";
    }
}

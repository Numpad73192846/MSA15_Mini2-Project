package com.aloha.teamproject.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TutorProfile {

    private Long no;
    private String userId;
    private String name;
    private String email;
    private String nickname;
    private String phone;
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String profileImg;
    private String headline;
    private String bio;
    private String selfIntro;
    private String videoUrl;
    private String defaultZoomUrl;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    @Builder.Default
    private boolean verified = false;
    @Builder.Default
    private BigDecimal ratingAvg = BigDecimal.ZERO;
    @Builder.Default
    private int reviewCount = 0;
    private Date createdAt;
    private Date updatedAt;

    public TutorProfile() {
        this.id = UUID.randomUUID().toString();
        this.verified = false;
        this.ratingAvg = BigDecimal.ZERO;
        this.reviewCount = 0;
    }

    @Data
    public static class Request {      
        private MultipartFile profileImg;
        private String basicPhone;
        private String headline;
        private String bio;
        private String selfIntro;
        private String videoUrl;
        private String basicBankName;
        private String basicAccountNumber;
        private String basicAccountHolder;
        private String careersJson;
        private String educationsJson;
        private String degreesJson;
        private String certificateTextsJson;
        private String lessonCardsJson;
        private List<String> fieldIds;
        private String phone;
    }
}

package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.Booking;
import com.aloha.teamproject.dto.Review;
import com.aloha.teamproject.service.BookingService;
import com.aloha.teamproject.service.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final BookingService bookingService;

    @GetMapping
    public ApiResponse<List<Review>> getAllReviews() {
        try {
            List<Review> reviews = reviewService.selectAll();
            return ApiResponse.ok(reviews);
        } catch (Exception e) {
            log.error("리뷰 목록 조회 실패", e);
            return ApiResponse.error("리뷰 목록을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Review> getReview(@PathVariable("id") String id) {
        try {
            Review review = reviewService.selectById(id);
            return ApiResponse.ok(review);
        } catch (Exception e) {
            log.error("리뷰 조회 실패", e);
            return ApiResponse.error("리뷰를 조회하지 못했습니다.");
        }
    }

    @GetMapping("/tutor/{tutorId}")
    public ApiResponse<List<Review>> getTutorReviews(@PathVariable String tutorId) {
        try {
            List<Review> reviews = reviewService.selectByTutorId(tutorId);
            return ApiResponse.ok(reviews);
        } catch (Exception e) {
            log.error("튜터 리뷰 조회 실패", e);
            return ApiResponse.error("리뷰를 조회하지 못했습니다.");
        }
    }

    @PostMapping
    public ApiResponse<Void> createReview(@RequestBody Review.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = authentication.getName();
            Booking booking = bookingService.selectById(request.getBookingId());
            if (booking == null) {
                return ApiResponse.error("예약을 찾을 수 없습니다.");
            }
            if (!userId.equals(booking.getUserId())) {
                return ApiResponse.error("리뷰 작성 권한이 없습니다.");
            }
            Review existing = reviewService.selectReviewByBookingId(request.getBookingId());
            if (existing != null) {
                return ApiResponse.error("이미 리뷰가 작성된 예약입니다.");
            }

            Review review = Review.builder()
                .bookingId(request.getBookingId())
                .rating(request.getRating())
                .content(request.getContent())
                .build();

            reviewService.insert(review);
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("리뷰 생성 실패", e);
            return ApiResponse.error("리뷰를 생성하지 못했습니다.");
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateReview(@PathVariable("id") String id, @RequestBody Review.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = authentication.getName();
            Review existing = reviewService.selectById(id);
            if (existing == null) {
                return ApiResponse.error("리뷰를 찾을 수 없습니다.");
            }
            Booking booking = bookingService.selectById(existing.getBookingId());
            if (booking == null) {
                return ApiResponse.error("예약을 찾을 수 없습니다.");
            }
            if (!userId.equals(booking.getUserId())) {
                return ApiResponse.error("리뷰 수정 권한이 없습니다.");
            }

            Review review = Review.builder()
                .id(id)
                .rating(request.getRating())
                .content(request.getContent())
                .build();

            reviewService.update(review);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("리뷰 수정 실패", e);
            return ApiResponse.error("리뷰를 수정하지 못했습니다.");
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteReview(@PathVariable("id") String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = authentication.getName();
            Review existing = reviewService.selectById(id);
            if (existing == null) {
                return ApiResponse.error("리뷰를 찾을 수 없습니다.");
            }
            Booking booking = bookingService.selectById(existing.getBookingId());
            if (booking == null) {
                return ApiResponse.error("예약을 찾을 수 없습니다.");
            }
            if (!userId.equals(booking.getUserId())) {
                return ApiResponse.error("리뷰 삭제 권한이 없습니다.");
            }

            reviewService.delete(id);
            return ApiResponse.ok(SuccessCode.DELETED);
        } catch (Exception e) {
            log.error("리뷰 삭제 실패", e);
            return ApiResponse.error("리뷰를 삭제하지 못했습니다.");
        }
    }

}

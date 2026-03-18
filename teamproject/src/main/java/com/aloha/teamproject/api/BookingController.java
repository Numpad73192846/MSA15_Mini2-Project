package com.aloha.teamproject.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.Booking;
import com.aloha.teamproject.dto.Lesson;
import com.aloha.teamproject.dto.StudentBooking;
import com.aloha.teamproject.dto.TutorAvailability;
import com.aloha.teamproject.dto.TutorProfile;
import com.aloha.teamproject.service.BookingService;
import com.aloha.teamproject.service.LessonService;
import com.aloha.teamproject.service.MemberMyPageService;
import com.aloha.teamproject.service.TutorAvailabilityService;
import com.aloha.teamproject.service.TutorProfileService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final TutorAvailabilityService tutorAvailabilityService;
    private final LessonService lessonService;
    private final MemberMyPageService memberMyPageService;
    private final TutorProfileService tutorProfileService;

    @GetMapping
    public ApiResponse<List<Booking>> getAllBookings(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            String userId = authentication.getName();
            List<Booking> bookings = bookingService.selectByUserId(userId);
            return ApiResponse.ok(bookings);
        } catch (Exception e) {
            log.error("[?덉빟 紐⑸줉 議고쉶 ?ㅽ뙣]", e);
            return ApiResponse.error("?덉빟 紐⑸줉??議고쉶?섏? 紐삵뻽?듬땲??");
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Booking> getBooking(@PathVariable("id") String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            Booking booking = bookingService.selectById(id);
            return ApiResponse.ok(booking);
        } catch (Exception e) {
            log.error("[?덉빟 議고쉶 ?ㅽ뙣] id={}", id, e);
            return ApiResponse.error("?덉빟??議고쉶?섏? 紐삵뻽?듬땲??");
        }
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<StudentBooking>> getStudentPastBookings(
            @PathVariable("studentId") String studentId,
            @RequestParam(name = "tutorId", required = false) String tutorId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            List<StudentBooking> pastBookings = memberMyPageService.selectPastBookings(studentId);
            if (tutorId != null && !tutorId.isEmpty()) {
                pastBookings = pastBookings.stream()
                        .filter(b -> tutorId.equals(b.getTutorId()))
                        .collect(Collectors.toList());
            }
            return ApiResponse.ok(pastBookings);
        } catch (Exception e) {
            log.error("[?숈깮 怨쇨굅 ?덉빟 議고쉶 ?ㅽ뙣] studentId={}", studentId, e);
            return ApiResponse.error("?덉빟??議고쉶?섏? 紐삵뻽?듬땲??");
        }
    }

    @PostMapping
    public ApiResponse<Void> createBooking(@RequestBody Booking.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            String userId = authentication.getName();
            Booking booking = Booking.builder()
                    .userId(userId)
                    .lessonId(request.getLessonId())
                    .availabilityId(request.getAvailabilityId())
                    .title(request.getTitle())
                    .memo(request.getMemo())
                    .zoomJoinUrl(request.getZoomJoinUrl())
                    .build();
            bookingService.insert(booking);
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("[?덉빟 ?앹꽦 ?ㅽ뙣]", e);
            return ApiResponse.error("?덉빟 ?앹꽦???ㅽ뙣?덉뒿?덈떎.");
        }
    }

    @PutMapping("/{id}/confirm")
    public ApiResponse<Void> confirmBooking(@PathVariable("id") String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            bookingService.confirmBooking(id);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("[?덉빟 ?뺤젙 ?ㅽ뙣] id={}", id, e);
            return ApiResponse.error("?덉빟 ?뺤젙???ㅽ뙣?덉뒿?덈떎.");
        }
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<Void> cancelBooking(@PathVariable("id") String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            Booking booking = bookingService.selectById(id);
            if (booking == null) {
                return ApiResponse.error("?덉빟 ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎.");
            }

            String actorId = authentication.getName();
            if (!canCancelBooking(actorId, booking)) {
                return ApiResponse.error("?덉빟 痍⑥냼 沅뚰븳???놁뒿?덈떎.");
            }

            bookingService.cancelBooking(id);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (IllegalStateException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("[?덉빟 痍⑥냼 ?ㅽ뙣] id={}", id, e);
            return ApiResponse.error("?덉빟 痍⑥냼???ㅽ뙣?덉뒿?덈떎.");
        }
    }

    @PutMapping("/{id}/complete")
    public ApiResponse<Void> completeBooking(@PathVariable("id") String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            bookingService.completeBooking(id);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("[?섏뾽 ?꾨즺 泥섎━ ?ㅽ뙣] id={}", id, e);
            return ApiResponse.error("?섏뾽 ?꾨즺 泥섎━???ㅽ뙣?덉뒿?덈떎.");
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBooking(@PathVariable("id") String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            bookingService.delete(id);
            return ApiResponse.ok(SuccessCode.DELETED);
        } catch (Exception e) {
            log.error("[?덉빟 ??젣 ?ㅽ뙣] id={}", id, e);
            return ApiResponse.error("?덉빟????젣?섏? 紐삵뻽?듬땲??");
        }
    }

    @PostMapping("/tutor/{tutorId}")
    public ApiResponse<Void> createTutorBooking(
            @PathVariable("tutorId") String tutorId,
            @RequestBody TutorBookingRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            String studentId = authentication.getName();
            LocalDateTime startAt = LocalDateTime.parse(request.getDate() + "T" + request.getTime() + ":00");
            LocalDateTime endAt = (request.getEndTime() != null && !request.getEndTime().isBlank())
                    ? LocalDateTime.parse(request.getDate() + "T" + request.getEndTime() + ":00")
                    : startAt.plusMinutes(30);
            long requestedMinutes = ChronoUnit.MINUTES.between(startAt, endAt);
            if (requestedMinutes <= 0 || (requestedMinutes % 30L) != 0L) {
                return ApiResponse.error("?덉빟 ?쒓컙? 30遺??⑥쐞濡쒕쭔 ?좏깮?????덉뒿?덈떎.");
            }

            List<TutorAvailability> availabilities = tutorAvailabilityService.selectByUserIdAndDateRange(
                    tutorId, startAt, endAt);
            List<TutorAvailability> openAvailabilities = availabilities.stream()
                    .filter(av -> av.getStatus() == TutorAvailability.Status.OPEN)
                    .filter(av -> av.getStartAt() != null && av.getEndAt() != null)
                    .toList();
            List<TutorAvailability> slotsToBook = collectContiguousSlots(openAvailabilities, startAt, endAt);
            if (slotsToBook.isEmpty()) {
                return ApiResponse.error("?좏깮???쒓컙?濡??덉빟??遺덇??ν빀?덈떎.");
            }

            TutorAvailability availability = chooseAnchorSlot(slotsToBook, startAt);
            if (availability == null) {
                return ApiResponse.error("?덉빟 媛?ν븳 ?쒖옉 ?щ’??李얠? 紐삵뻽?듬땲??");
            }

            List<Lesson> lessons = lessonService.selectByUserId(tutorId);
            Lesson lesson = lessons.stream()
                    .filter(l -> "OPEN".equals(l.getStatus()))
                    .findFirst()
                    .orElse(null);

            if (lesson == null) {
                lesson = Lesson.builder()
                        .userId(tutorId)
                        .title(request.getSubject())
                        .description("?쒗꽣留??섏뾽")
                        .status("OPEN")
                        .price(BigDecimal.ZERO)
                        .build();
                lessonService.insert(lesson);
            }

            String zoomJoinUrl = null;
            TutorProfile tutorProfile = tutorProfileService.selectByUserId(tutorId);
            if (tutorProfile != null && tutorProfile.getDefaultZoomUrl() != null && !tutorProfile.getDefaultZoomUrl().isBlank()) {
                zoomJoinUrl = tutorProfile.getDefaultZoomUrl().trim();
            }

            Booking booking = Booking.builder()
                    .userId(studentId)
                    .lessonId(lesson.getId())
                    .availabilityId(availability.getId())
                    .title(request.getSubject() + " ?섏뾽")
                    .memo(request.getMessage())
                    .zoomJoinUrl(zoomJoinUrl)
                    .build();
            bookingService.insert(booking);

            tutorAvailabilityService.updateRangeAndStatus(availability.getId(), startAt, endAt, "BOOKED");
            List<String> siblingIds = slotsToBook.stream()
                    .map(TutorAvailability::getId)
                    .filter(Objects::nonNull)
                    .filter(slotId -> !slotId.equals(availability.getId()))
                    .distinct()
                    .toList();
            if (!siblingIds.isEmpty()) {
                tutorAvailabilityService.updateStatusBatch(siblingIds, "CANCELLED");
            }

            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("[?쒗꽣 ?덉빟 ?앹꽦 ?ㅽ뙣] tutorId={}, request={}", tutorId, request, e);
            return ApiResponse.error("?덉빟 ?앹꽦???ㅽ뙣?덉뒿?덈떎.");
        }
    }

    @PutMapping("/{id}/reschedule")
    public ApiResponse<Void> rescheduleBooking(
            @PathVariable("id") String id,
            @RequestBody RescheduleRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }
        if (request == null || request.getDate() == null || request.getTime() == null) {
            return ApiResponse.error("蹂寃쏀븷 ?섏뾽 ?쒓컙???낅젰?댁＜?몄슂.");
        }

        try {
            Booking booking = bookingService.selectById(id);
            if (booking == null) {
                return ApiResponse.error("예약 정보를 찾을 수 없습니다.");
            }
            if (booking.getCanceledAt() != null) {
                return ApiResponse.error("이미 취소된 예약입니다.");
            }
            if (booking.getDoneAt() != null) {
                return ApiResponse.error("이미 완료된 예약은 시간 변경이 불가합니다.");
            }

            Lesson lesson = lessonService.selectById(booking.getLessonId());
            if (lesson == null || lesson.getUserId() == null) {
                return ApiResponse.error("?섏뾽 ?뺣낫瑜?李얠쓣 ???놁뒿?덈떎.");
            }

            String tutorId = lesson.getUserId();
            String actorId = authentication.getName();
            if (!tutorId.equals(actorId)) {
                return ApiResponse.error("?쒗꽣留??덉빟 ?쒓컙??蹂寃쏀븷 ???덉뒿?덈떎.");
            }

            LocalDateTime startAt = LocalDateTime.parse(request.getDate() + "T" + request.getTime() + ":00");
            LocalDateTime endAt = (request.getEndTime() != null && !request.getEndTime().isBlank())
                    ? LocalDateTime.parse(request.getDate() + "T" + request.getEndTime() + ":00")
                    : startAt.plusMinutes(30);
            long requestedMinutes = ChronoUnit.MINUTES.between(startAt, endAt);
            if (requestedMinutes <= 0 || (requestedMinutes % 30L) != 0L) {
                return ApiResponse.error("?덉빟 ?쒓컙? 30遺??⑥쐞濡쒕쭔 ?ㅼ젙?????덉뒿?덈떎.");
            }

            List<TutorAvailability> availabilities = tutorAvailabilityService.selectByUserIdAndDateRange(
                    tutorId, startAt, endAt);
            List<TutorAvailability> openAvailabilities = availabilities.stream()
                    .filter(av -> av.getStatus() == TutorAvailability.Status.OPEN)
                    .filter(av -> av.getStartAt() != null && av.getEndAt() != null)
                    .toList();
            List<TutorAvailability> slotsToBook = collectContiguousSlots(openAvailabilities, startAt, endAt);
            if (slotsToBook.isEmpty()) {
                return ApiResponse.error("?좏깮???쒓컙?쇰줈 ?덉빟????만 ???놁뒿?덈떎.");
            }

            TutorAvailability newAnchor = chooseAnchorSlot(slotsToBook, startAt);
            if (newAnchor == null) {
                return ApiResponse.error("蹂寃?媛?ν븳 ?쒓컙 ?щ’??李얠쓣 ???놁뒿?덈떎.");
            }

            String oldAvailabilityId = booking.getAvailabilityId();
            bookingService.updateAvailabilityId(id, newAnchor.getId());

            if (oldAvailabilityId != null && !oldAvailabilityId.equals(newAnchor.getId())) {
                tutorAvailabilityService.updateStatus(oldAvailabilityId, "OPEN");
            }

            tutorAvailabilityService.updateRangeAndStatus(newAnchor.getId(), startAt, endAt, "BOOKED");
            List<String> siblingIds = slotsToBook.stream()
                    .map(TutorAvailability::getId)
                    .filter(Objects::nonNull)
                    .filter(slotId -> !slotId.equals(newAnchor.getId()))
                    .distinct()
                    .toList();
            if (!siblingIds.isEmpty()) {
                tutorAvailabilityService.updateStatusBatch(siblingIds, "CANCELLED");
            }

            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("[?덉빟 ?쒓컙 蹂寃??ㅽ뙣] bookingId={}, request={}", id, request, e);
            return ApiResponse.error("?덉빟 ?쒓컙 蹂寃쎌뿉 ?ㅽ뙣?덉뒿?덈떎.");
        }
    }

    private List<TutorAvailability> collectContiguousSlots(
            List<TutorAvailability> openAvailabilities,
            LocalDateTime startAt,
            LocalDateTime endAt) {
        if (openAvailabilities == null || openAvailabilities.isEmpty()) {
            return List.of();
        }

        List<TutorAvailability> sorted = openAvailabilities.stream()
                .filter(Objects::nonNull)
                .filter(item -> item.getStartAt() != null && item.getEndAt() != null)
                .sorted(Comparator.comparing(TutorAvailability::getStartAt).thenComparing(TutorAvailability::getEndAt))
                .toList();
        if (sorted.isEmpty()) {
            return List.of();
        }

        List<TutorAvailability> covered = new ArrayList<>();
        LocalDateTime cursor = startAt;
        while (cursor.isBefore(endAt)) {
            LocalDateTime segmentEnd = cursor.plusMinutes(30);
            TutorAvailability slot = null;
            for (TutorAvailability item : sorted) {
                if (!item.getStartAt().isAfter(cursor) && !item.getEndAt().isBefore(segmentEnd)) {
                    slot = item;
                    break;
                }
            }

            if (slot == null) {
                return List.of();
            }
            covered.add(slot);
            cursor = segmentEnd;
        }

        Map<String, TutorAvailability> dedup = new LinkedHashMap<>();
        for (TutorAvailability item : covered) {
            if (item == null || item.getId() == null) {
                continue;
            }
            dedup.putIfAbsent(item.getId(), item);
        }
        return new ArrayList<>(dedup.values());
    }

    private TutorAvailability chooseAnchorSlot(List<TutorAvailability> slotsToBook, LocalDateTime startAt) {
        if (slotsToBook == null || slotsToBook.isEmpty()) {
            return null;
        }

        return slotsToBook.stream()
                .filter(item -> item.getStartAt() != null)
                .filter(item -> item.getStartAt().equals(startAt))
                .min(Comparator.comparing(TutorAvailability::getEndAt))
                .orElseGet(() -> slotsToBook.stream()
                        .filter(item -> item.getStartAt() != null)
                        .min(Comparator.comparing(TutorAvailability::getStartAt))
                        .orElse(null));
    }

    private boolean canCancelBooking(String actorId, Booking booking) throws Exception {
        if (actorId == null || booking == null) {
            return false;
        }
        if (actorId.equals(booking.getUserId())) {
            return true;
        }
        Lesson lesson = lessonService.selectById(booking.getLessonId());
        return lesson != null && actorId.equals(lesson.getUserId());
    }

    /**
     * ?덉빟 寃곗젣 泥섎━
     */
    @PutMapping("/tutor/confirm-all")
    public ApiResponse<BulkOperationResult> confirmAllPendingBookings(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String tutorId = authentication.getName();
            List<Booking> tutorBookings = bookingService.selectByTutorId(tutorId);

            List<Booking> pendingBookings = tutorBookings.stream()
                    .filter(Objects::nonNull)
                    .filter(booking -> booking.getId() != null && !booking.getId().isBlank())
                    .filter(booking -> booking.getConfirmedAt() == null)
                    .filter(booking -> booking.getCanceledAt() == null)
                    .filter(booking -> booking.getDoneAt() == null)
                    .toList();

            int targetCount = pendingBookings.size();
            int successCount = 0;
            List<String> failedBookingIds = new ArrayList<>();

            for (Booking booking : pendingBookings) {
                try {
                    int updated = bookingService.confirmBooking(booking.getId());
                    if (updated > 0) {
                        successCount++;
                    } else {
                        failedBookingIds.add(booking.getId());
                    }
                } catch (Exception e) {
                    failedBookingIds.add(booking.getId());
                    log.warn("[전체 수락 실패] bookingId={}", booking.getId(), e);
                }
            }

            BulkOperationResult result = new BulkOperationResult();
            result.setTargetCount(targetCount);
            result.setSuccessCount(successCount);
            result.setFailedCount(targetCount - successCount);
            result.setFailedBookingIds(failedBookingIds);
            result.setTotalAmount(null);

            return ApiResponse.ok(result);
        } catch (Exception e) {
            log.error("[전체 수락 처리 실패]", e);
            return ApiResponse.error("전체 수락 처리에 실패했습니다.");
        }
    }

    @PostMapping("/pay-all")
    public ApiResponse<BulkOperationResult> payAllUpcomingBookings(
            @RequestBody(required = false) PaymentRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = authentication.getName();
            String provider = (request != null && request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                    ? request.getPaymentMethod().toUpperCase()
                    : "CARD";

            List<StudentBooking> upcomingBookings = memberMyPageService.selectUpcomingBookings(userId);
            List<StudentBooking> targetBookings = upcomingBookings.stream()
                    .filter(Objects::nonNull)
                    .filter(booking -> booking.getBookingId() != null && !booking.getBookingId().isBlank())
                    .filter(booking -> "CONFIRMED".equalsIgnoreCase(booking.getStatus()))
                    .filter(booking -> booking.getPaidAt() == null)
                    .toList();

            int targetCount = targetBookings.size();
            int successCount = 0;
            List<String> failedBookingIds = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;

            for (StudentBooking booking : targetBookings) {
                BigDecimal amount = booking.getPrice() != null ? booking.getPrice() : BigDecimal.ZERO;
                try {
                    bookingService.payBooking(booking.getBookingId(), amount, provider);
                    successCount++;
                    totalAmount = totalAmount.add(amount);
                } catch (Exception e) {
                    failedBookingIds.add(booking.getBookingId());
                    log.warn("[전체 결제 실패] bookingId={}", booking.getBookingId(), e);
                }
            }

            BulkOperationResult result = new BulkOperationResult();
            result.setTargetCount(targetCount);
            result.setSuccessCount(successCount);
            result.setFailedCount(targetCount - successCount);
            result.setFailedBookingIds(failedBookingIds);
            result.setTotalAmount(totalAmount.longValue());

            return ApiResponse.ok(result);
        } catch (Exception e) {
            log.error("[전체 결제 처리 실패]", e);
            return ApiResponse.error("전체 결제 처리에 실패했습니다.");
        }
    }

    @PostMapping("/{id}/pay")
    public ApiResponse<Void> payBooking(
            @PathVariable("id") String id,
            @RequestBody PaymentRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
        }

        try {
            String userId = authentication.getName();
            Booking booking = bookingService.selectById(id);
            if (booking == null) {
                return ApiResponse.error("?덉빟??李얠쓣 ???놁뒿?덈떎.");
            }
            if (!userId.equals(booking.getUserId())) {
                return ApiResponse.error("寃곗젣 沅뚰븳???놁뒿?덈떎.");
            }

            BigDecimal amount = request.getAmount() != null
                    ? BigDecimal.valueOf(request.getAmount())
                    : BigDecimal.ZERO;
            String provider = request.getPaymentMethod() != null
                    ? request.getPaymentMethod().toUpperCase()
                    : "UNKNOWN";

            bookingService.payBooking(id, amount, provider);
            return ApiResponse.ok(SuccessCode.OK);
        } catch (Exception e) {
            log.error("[?덉빟 寃곗젣 ?ㅽ뙣] bookingId={}", id, e);
            return ApiResponse.error("寃곗젣 泥섎━???ㅽ뙣?덉뒿?덈떎.");
        }
    }

    @Data
    public static class TutorBookingRequest {
        private String date;
        private String time;
        private String endTime;
        private String subject;
        private String message;
    }

    @Data
    public static class RescheduleRequest {
        private String date;
        private String time;
        private String endTime;
    }

    @Data
    public static class PaymentRequest {
        private String paymentMethod;
        private Integer amount;
    }

    @Data
    public static class BulkOperationResult {
        private Integer targetCount;
        private Integer successCount;
        private Integer failedCount;
        private List<String> failedBookingIds;
        private Long totalAmount;
    }
}


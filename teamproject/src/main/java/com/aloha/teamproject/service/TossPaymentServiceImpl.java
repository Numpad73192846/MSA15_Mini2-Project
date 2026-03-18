package com.aloha.teamproject.service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.aloha.teamproject.config.TossPaymentsProperties;
import com.aloha.teamproject.dto.Booking;
import com.aloha.teamproject.dto.Lesson;
import com.aloha.teamproject.dto.Payment;
import com.aloha.teamproject.dto.StudentBooking;
import com.aloha.teamproject.dto.TossBatchPaymentPrepare;
import com.aloha.teamproject.dto.TossPaymentOrder;
import com.aloha.teamproject.dto.TossPaymentOrderItem;
import com.aloha.teamproject.dto.TutorAvailability;
import com.aloha.teamproject.mapper.PaymentMapper;
import com.aloha.teamproject.mapper.TossPaymentOrderMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TossPaymentServiceImpl implements TossPaymentService {

    private static final String CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

    private final TossPaymentsProperties properties;
    private final BookingService bookingService;
    private final LessonService lessonService;
    private final TutorAvailabilityService tutorAvailabilityService;
    private final MemberMyPageService memberMyPageService;
    private final TossPaymentOrderMapper tossPaymentOrderMapper;
    private final PaymentMapper paymentMapper;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public TossBatchPaymentPrepare prepareTutorBatchPayment(String userId, String tutorId) throws Exception {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        if (tutorId == null || tutorId.isBlank()) {
            throw new IllegalArgumentException("튜터 정보가 올바르지 않습니다.");
        }

        List<StudentBooking> upcomingBookings = memberMyPageService.selectUpcomingBookings(userId);
        List<StudentBooking> targetBookings = upcomingBookings.stream()
                .filter(Objects::nonNull)
                .filter(booking -> tutorId.equals(booking.getTutorId()))
                .filter(booking -> "CONFIRMED".equalsIgnoreCase(booking.getStatus()))
                .filter(booking -> booking.getPaidAt() == null)
                .toList();

        if (targetBookings.isEmpty()) {
            throw new IllegalArgumentException("해당 튜터의 결제 가능한 수업이 없습니다.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<TossPaymentOrderItem> items = new ArrayList<>();

        for (StudentBooking booking : targetBookings) {
            BigDecimal amount = booking.getPrice() != null ? booking.getPrice() : BigDecimal.ZERO;
            totalAmount = totalAmount.add(amount);
            items.add(TossPaymentOrderItem.builder()
                    .orderId(null)
                    .bookingId(booking.getBookingId())
                    .amount(amount)
                    .build());
        }

        String tutorName = targetBookings.stream()
                .map(StudentBooking::getTutorName)
                .filter(name -> name != null && !name.isBlank())
                .findFirst()
                .orElse("튜터");

        String orderId = generateUniqueBatchOrderId(tutorId);
        TossPaymentOrder order = TossPaymentOrder.builder()
                .orderId(orderId)
                .userId(userId)
                .tutorId(tutorId)
                .tutorName(tutorName)
                .bookingCount(items.size())
                .totalAmount(totalAmount)
                .status("READY")
                .build();

        tossPaymentOrderMapper.insertOrder(order);
        for (TossPaymentOrderItem item : items) {
            item.setOrderId(orderId);
            tossPaymentOrderMapper.insertOrderItem(item);
        }

        return TossBatchPaymentPrepare.builder()
                .orderId(orderId)
                .tutorId(tutorId)
                .tutorName(tutorName)
                .bookingCount(items.size())
                .amount(totalAmount.longValue())
                .build();
    }

    @Override
    public void confirmAndPay(String paymentKey, String orderId, Long amount, String userId) throws Exception {
        if (paymentKey == null || paymentKey.isBlank()) {
            throw new IllegalArgumentException("paymentKey가 필요합니다.");
        }
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("orderId가 필요합니다.");
        }
        if (amount == null) {
            throw new IllegalArgumentException("amount가 필요합니다.");
        }

        TossPaymentOrder batchOrder = tossPaymentOrderMapper.selectOrderByOrderId(orderId);
        if (batchOrder != null) {
            confirmTutorBatchOrder(paymentKey, orderId, amount, userId, batchOrder);
            return;
        }

        confirmSingleBookingOrder(paymentKey, orderId, amount, userId);
    }

    private void confirmTutorBatchOrder(
            String paymentKey,
            String orderId,
            Long amount,
            String userId,
            TossPaymentOrder batchOrder) throws Exception {

        if (userId != null && !userId.equals(batchOrder.getUserId())) {
            throw new IllegalArgumentException("결제 권한이 없습니다.");
        }

        BigDecimal paidAmount = BigDecimal.valueOf(amount);
        if (batchOrder.getTotalAmount() != null && batchOrder.getTotalAmount().compareTo(paidAmount) != 0) {
            throw new IllegalArgumentException("결제 금액이 주문 금액과 일치하지 않습니다.");
        }

        if ("PAID".equalsIgnoreCase(batchOrder.getStatus())) {
            log.info("[Toss Batch Confirm] already paid orderId={}", orderId);
            return;
        }

        List<TossPaymentOrderItem> items = tossPaymentOrderMapper.selectItemsByOrderId(orderId);
        if (items == null || items.isEmpty()) {
            throw new IllegalStateException("배치 결제 주문 항목이 없습니다.");
        }

        for (TossPaymentOrderItem item : items) {
            Booking booking = bookingService.selectById(item.getBookingId());
            if (booking == null) {
                throw new IllegalStateException("결제 대상 예약을 찾을 수 없습니다.");
            }
            if (!batchOrder.getUserId().equals(booking.getUserId())) {
                throw new IllegalArgumentException("주문 정보와 예약 정보가 일치하지 않습니다.");
            }
        }

        confirmWithToss(paymentKey, orderId, amount);

        for (TossPaymentOrderItem item : items) {
            Booking booking = bookingService.selectById(item.getBookingId());
            if (booking == null) {
                continue;
            }
            Payment existingPayment = paymentMapper.selectByBookingId(item.getBookingId());
            if (existingPayment != null && "PAID".equalsIgnoreCase(existingPayment.getStatus())) {
                continue;
            }

            BigDecimal itemAmount = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            try {
                bookingService.payBooking(item.getBookingId(), itemAmount, "TOSS");
            } catch (Exception e) {
                Payment reloadedPayment = paymentMapper.selectByBookingId(item.getBookingId());
                if (reloadedPayment != null && "PAID".equalsIgnoreCase(reloadedPayment.getStatus())) {
                    continue;
                }
                throw e;
            }
        }

        tossPaymentOrderMapper.markOrderPaid(orderId, paymentKey);
    }

    private void confirmSingleBookingOrder(String paymentKey, String orderId, Long amount, String userId) throws Exception {
        String bookingId = extractBookingId(orderId);
        Booking booking = bookingService.selectById(bookingId);
        if (booking == null) {
            throw new IllegalArgumentException("예약을 찾을 수 없습니다.");
        }
        if (userId != null && !userId.equals(booking.getUserId())) {
            throw new IllegalArgumentException("결제 권한이 없습니다.");
        }

        Lesson lesson = lessonService.selectById(booking.getLessonId());
        BigDecimal expectedAmount = null;
        if (lesson != null && lesson.getPrice() != null) {
            TutorAvailability availability = tutorAvailabilityService.selectById(booking.getAvailabilityId());
            long minutes = 30L;
            if (availability != null && availability.getStartAt() != null && availability.getEndAt() != null) {
                long diff = ChronoUnit.MINUTES.between(availability.getStartAt(), availability.getEndAt());
                if (diff > 0) {
                    minutes = diff;
                }
            }
            long slotCount = Math.max(1L, minutes / 30L);
            expectedAmount = lesson.getPrice().multiply(BigDecimal.valueOf(slotCount));
        }
        BigDecimal paidAmount = BigDecimal.valueOf(amount);

        if (expectedAmount != null && expectedAmount.compareTo(paidAmount) != 0) {
            throw new IllegalArgumentException("결제 금액이 일치하지 않습니다.");
        }

        Payment existingPayment = paymentMapper.selectByBookingId(bookingId);
        if (existingPayment != null && "PAID".equalsIgnoreCase(existingPayment.getStatus())) {
            log.info("[Toss Single Confirm] already paid bookingId={}", bookingId);
            return;
        }

        confirmWithToss(paymentKey, orderId, amount);
        try {
            bookingService.payBooking(bookingId, paidAmount, "TOSS");
        } catch (Exception e) {
            Payment reloadedPayment = paymentMapper.selectByBookingId(bookingId);
            if (reloadedPayment != null && "PAID".equalsIgnoreCase(reloadedPayment.getStatus())) {
                return;
            }
            throw e;
        }
    }

    @Override
    public void confirmWithToss(String paymentKey, String orderId, Long amount) {
        String secretKey = properties.getSecretKey();
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("토스 시크릿키가 설정되지 않았습니다.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(secretKey, "");

        Map<String, Object> body = new HashMap<>();
        body.put("paymentKey", paymentKey);
        body.put("orderId", orderId);
        body.put("amount", amount);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(CONFIRM_URL, entity, Map.class);
            log.info("[Toss Confirm] status: {}", response.getStatusCode());
        } catch (HttpStatusCodeException e) {
            log.error("[Toss Confirm Fail] status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("토스 결제 확인에 실패했습니다.");
        }
    }

    @Override
    public String extractBookingId(String orderId) {
        int idx = orderId.indexOf('_');
        if (idx > 0) {
            return orderId.substring(0, idx);
        }
        return orderId;
    }

    private String generateUniqueBatchOrderId(String tutorId) throws Exception {
        for (int i = 0; i < 5; i++) {
            String orderId = generateBatchOrderId(tutorId);
            TossPaymentOrder exists = tossPaymentOrderMapper.selectOrderByOrderId(orderId);
            if (exists == null) {
                return orderId;
            }
        }
        throw new IllegalStateException("주문 번호 생성에 실패했습니다. 다시 시도해주세요.");
    }

    private String generateBatchOrderId(String tutorId) {
        String normalizedTutor = String.valueOf(tutorId).replaceAll("[^a-zA-Z0-9]", "");
        if (normalizedTutor.length() > 20) {
            normalizedTutor = normalizedTutor.substring(normalizedTutor.length() - 20);
        }
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        return "tb_" + normalizedTutor + "_" + random;
    }
}

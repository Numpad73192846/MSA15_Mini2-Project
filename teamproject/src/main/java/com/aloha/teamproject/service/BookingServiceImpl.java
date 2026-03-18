package com.aloha.teamproject.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.Booking;
import com.aloha.teamproject.dto.Payment;
import com.aloha.teamproject.dto.TutorAvailability;
import com.aloha.teamproject.mapper.BookingMapper;
import com.aloha.teamproject.mapper.PaymentMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl extends BaseServiceImpl implements BookingService {

    private final BookingMapper bookingMapper;
    private final PaymentMapper paymentMapper;
    private final TutorAvailabilityService tutorAvailabilityService;

    @Override
    public List<Booking> selectAll() throws Exception {
        return bookingMapper.selectAll();
    }

    @Override
    public Booking selectById(String id) throws Exception {
        return bookingMapper.selectById(id);
    }

    @Override
    public List<Booking> selectByUserId(String userId) throws Exception {
        return bookingMapper.selectByUserId(userId);
    }

    @Override
    public List<Booking> selectByTutorId(String tutorId) throws Exception {
        return bookingMapper.selectByTutorId(tutorId);
    }

    @Override
    @Transactional
    public int insert(Booking booking) throws Exception {
        return bookingMapper.insert(booking);
    }

    @Override
    @Transactional
    public int update(Booking booking) throws Exception {
        return bookingMapper.update(booking);
    }

    @Override
    @Transactional
    public int delete(String id) throws Exception {
        return bookingMapper.delete(id);
    }

    @Override
    @Transactional
    public int confirmBooking(String id) throws Exception {
        return bookingMapper.confirmBooking(id);
    }

    @Override
    @Transactional
    public int cancelBooking(String id) throws Exception {
        Booking booking = bookingMapper.selectById(id);
        if (booking == null) {
            throw new IllegalStateException("예약 정보를 찾을 수 없습니다.");
        }

        if (booking.getCanceledAt() != null) {
            return 1;
        }

        Payment payment = paymentMapper.selectByBookingId(id);
        boolean paid = payment != null && "PAID".equalsIgnoreCase(payment.getStatus());

        if (paid) {
            TutorAvailability availability = tutorAvailabilityService.selectById(booking.getAvailabilityId());
            if (availability != null && availability.getStartAt() != null) {
                LocalDateTime cancelDeadline = availability.getStartAt().minusDays(3);
                if (LocalDateTime.now().isAfter(cancelDeadline)) {
                    throw new IllegalStateException("수업 3일 전까지만 취소할 수 있습니다.");
                }
            }

            if (paid) {
                payment.setStatus("REFUNDED");
                paymentMapper.update(payment);
            }

            bookingMapper.clearPaidAt(id);
        }

        return bookingMapper.cancelBooking(id);
    }

    @Override
    @Transactional
    public int completeBooking(String id) throws Exception {
        int updated = bookingMapper.completeBooking(id);
        if (updated <= 0) {
            throw new IllegalStateException("결제 완료 후 수업 시간이 지난 예약만 완료 처리할 수 있습니다.");
        }
        return updated;
    }

    @Override
    @Transactional
    public int payBooking(String id, BigDecimal amount, String provider) throws Exception {
        Booking booking = bookingMapper.selectById(id);
        if (booking == null) {
            throw new Exception("예약을 찾을 수 없습니다.");
        }

        Payment existingPayment = paymentMapper.selectByBookingId(id);
        if (existingPayment != null) {
            throw new Exception("이미 결제된 예약입니다.");
        }

        Payment payment = Payment.builder()
            .userId(booking.getUserId())
            .bookingId(id)
            .amount(amount)
            .provider(provider)
            .status("PAID")
            .paidAt(LocalDateTime.now())
            .build();
        int result = paymentMapper.insert(payment);
        bookingMapper.updatePaidAt(id);
        return result;

    }

    @Override
    @Transactional
    public int updateAvailabilityId(String id, String availabilityId) throws Exception {
        return bookingMapper.updateAvailabilityId(id, availabilityId);
    }

}

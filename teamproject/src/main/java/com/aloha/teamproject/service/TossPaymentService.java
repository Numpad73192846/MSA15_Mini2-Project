package com.aloha.teamproject.service;

import com.aloha.teamproject.dto.TossBatchPaymentPrepare;

public interface TossPaymentService {

    public TossBatchPaymentPrepare prepareTutorBatchPayment(String userId, String tutorId) throws Exception;

    public void confirmAndPay(String paymentKey, String orderId, Long amount, String userId) throws Exception;

    public void confirmWithToss(String paymentKey, String orderId, Long amount) throws Exception;

    public String extractBookingId(String orderId) throws Exception;
    
}

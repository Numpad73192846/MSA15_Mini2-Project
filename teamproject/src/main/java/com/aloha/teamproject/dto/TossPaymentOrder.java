package com.aloha.teamproject.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TossPaymentOrder {

    private String id;
    private String orderId;
    private String userId;
    private String tutorId;
    private String tutorName;
    private Integer bookingCount;
    private BigDecimal totalAmount;
    private String status;
    private String paymentKey;
    private LocalDateTime paidAt;
}

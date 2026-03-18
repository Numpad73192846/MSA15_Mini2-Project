package com.aloha.teamproject.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TossPaymentOrderItem {

    private String id;
    private String orderId;
    private String bookingId;
    private BigDecimal amount;
}

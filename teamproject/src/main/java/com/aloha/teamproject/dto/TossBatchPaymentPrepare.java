package com.aloha.teamproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TossBatchPaymentPrepare {

    private String orderId;
    private String tutorId;
    private String tutorName;
    private Integer bookingCount;
    private Long amount;
}

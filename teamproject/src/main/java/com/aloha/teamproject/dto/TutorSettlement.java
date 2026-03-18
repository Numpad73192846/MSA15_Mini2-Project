package com.aloha.teamproject.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class TutorSettlement {
    private String userId;
    private String userName;
    private String nickname;
    private BigDecimal totalAmount; // Total income from payments
    private BigDecimal remittedAmount; // Amount already sent (we can mock this or assume 0 for now)
    private BigDecimal balance; // Amount to be sent (total - remitted)
    private String status; // 'PENDING', 'COMPLETED'
}

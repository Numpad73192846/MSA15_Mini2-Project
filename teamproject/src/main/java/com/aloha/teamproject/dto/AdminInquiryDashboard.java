package com.aloha.teamproject.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class AdminInquiryDashboard {
    private BigDecimal totalAmount;
    private Integer settleWaitCount;
    private Integer docWaitCount;
    private Integer newUsersCount;
    private Integer doneCount;
    private List<AdminInquiry> recentInquiries = new ArrayList<>();
}

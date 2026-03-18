package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.Payment;

@Mapper
public interface PaymentMapper {

    public List<Payment> selectAll() throws Exception;

    public Payment selectById(String id) throws Exception;

    public List<Payment> selectByUserId(String userId) throws Exception;

    public Payment selectByBookingId(String bookingId) throws Exception;

    public int insert(Payment payment) throws Exception;

    public int update(Payment payment) throws Exception;

    public int delete(String id) throws Exception;

}

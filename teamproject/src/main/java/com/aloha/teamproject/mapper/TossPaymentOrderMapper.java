package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.TossPaymentOrder;
import com.aloha.teamproject.dto.TossPaymentOrderItem;

@Mapper
public interface TossPaymentOrderMapper {

    int insertOrder(TossPaymentOrder order) throws Exception;

    int insertOrderItem(TossPaymentOrderItem item) throws Exception;

    TossPaymentOrder selectOrderByOrderId(String orderId) throws Exception;

    List<TossPaymentOrderItem> selectItemsByOrderId(String orderId) throws Exception;

    int markOrderPaid(@Param("orderId") String orderId, @Param("paymentKey") String paymentKey) throws Exception;
}

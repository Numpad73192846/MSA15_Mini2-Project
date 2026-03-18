package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.Booking;

public interface BookingService {

    public List<Booking> selectAll() throws Exception;

    public Booking selectById(String id) throws Exception;

    public List<Booking> selectByUserId(String userId) throws Exception;

    public List<Booking> selectByTutorId(String tutorId) throws Exception;

    public int insert(Booking booking) throws Exception;

    public int update(Booking booking) throws Exception;

    public int delete(String id) throws Exception;

    public int confirmBooking(String id) throws Exception;

    public int cancelBooking(String id) throws Exception;

    public int completeBooking(String id) throws Exception;

    public int payBooking(String id, java.math.BigDecimal amount, String provider) throws Exception;

    public int updateAvailabilityId(String id, String availabilityId) throws Exception;

}

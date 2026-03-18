package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.Booking;

@Mapper
public interface BookingMapper {

    List<Booking> selectAll() throws Exception;

    Booking selectById(String id) throws Exception;

    List<Booking> selectByUserId(String userId) throws Exception;

    List<Booking> selectByTutorId(String tutorId) throws Exception;

    int insert(Booking booking) throws Exception;

    int update(Booking booking) throws Exception;

    int delete(String id) throws Exception;

    int confirmBooking(String id) throws Exception;

    int cancelBooking(String id) throws Exception;

    int completeBooking(String id) throws Exception;

    int updatePaidAt(String id);

    int clearPaidAt(String id);

    int updateAvailabilityId(
            @Param("id") String id,
            @Param("availabilityId") String availabilityId
    );
}

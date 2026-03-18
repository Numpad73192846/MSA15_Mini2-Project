package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.Review;

@Mapper
public interface ReviewMapper {
	
	public List<Review> selectReviewsByTutor(String tutorId) throws Exception;

	public Review selectReviewByBookingId(String bookingId) throws Exception;

    public List<Review> selectAll() throws Exception;

    public Review selectById(String id) throws Exception;

    public Review selectByBookingId(String bookingId) throws Exception;

    public List<Review> selectByTutorId(String tutorId) throws Exception;

    public int insert(Review review) throws Exception;

    public int update(Review review) throws Exception;

    public int delete(String id) throws Exception;

}

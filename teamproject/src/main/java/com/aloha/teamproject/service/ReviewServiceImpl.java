package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.Review;
import com.aloha.teamproject.mapper.ReviewMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl extends BaseServiceImpl implements ReviewService {

	private final ReviewMapper reviewMapper;
	
	@Override
	public List<Review> selectReviewsByTutor(String tutorId) throws Exception {
		return reviewMapper.selectReviewsByTutor(tutorId);
	}

	@Override
	public Review selectReviewByBookingId(String bookingId) throws Exception {
		return reviewMapper.selectReviewByBookingId(bookingId);
	}

    @Override
    public List<Review> selectAll() throws Exception {
        return reviewMapper.selectAll();
    }

    @Override
    public Review selectById(String id) throws Exception {
        return reviewMapper.selectById(id);
    }

    @Override
    public Review selectByBookingId(String bookingId) throws Exception {
        return reviewMapper.selectByBookingId(bookingId);
    }

    @Override
    public List<Review> selectByTutorId(String tutorId) throws Exception {
        return reviewMapper.selectByTutorId(tutorId);
    }

    @Override
    @Transactional
    public int insert(Review review) throws Exception {
        return reviewMapper.insert(review);
    }

    @Override
    @Transactional
    public int update(Review review) throws Exception {
        return reviewMapper.update(review);
    }

    @Override
    @Transactional
    public int delete(String id) throws Exception {
        return reviewMapper.delete(id);
    }

}

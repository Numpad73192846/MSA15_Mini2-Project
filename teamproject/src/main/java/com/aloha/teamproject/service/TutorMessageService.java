package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.TutorMessage;

public interface TutorMessageService {

    void sendMessage(String tutorId, String studentId, String bookingId, String content) throws Exception;

    void sendReply(String studentId, String tutorId, String bookingId, String content) throws Exception;

    List<TutorMessage> selectStudentRepliesByTutorId(String tutorId) throws Exception;

    List<TutorMessage> selectThread(String tutorId, String studentId, String bookingId) throws Exception;

    boolean isReplyWritable(String studentId, String tutorId, String bookingId) throws Exception;
}

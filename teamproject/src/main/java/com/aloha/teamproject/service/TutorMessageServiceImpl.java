package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorMessage;
import com.aloha.teamproject.mapper.TutorMessageMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorMessageServiceImpl extends BaseServiceImpl implements TutorMessageService {

    private final TutorMessageMapper tutorMessageMapper;

    @Override
    public void sendMessage(String tutorId, String studentId, String bookingId, String content) throws Exception {
        insertMessage(tutorId, studentId, bookingId, content, "TUTOR");
    }

    @Override
    public void sendReply(String studentId, String tutorId, String bookingId, String content) throws Exception {
        insertMessage(tutorId, studentId, bookingId, content, "STUDENT");
    }

    @Override
    public List<TutorMessage> selectStudentRepliesByTutorId(String tutorId) throws Exception {
        requiredNotBlank(tutorId, ErrorCode.INVALID_REQUEST);
        return tutorMessageMapper.selectStudentRepliesByTutorId(tutorId);
    }

    @Override
    public List<TutorMessage> selectThread(String tutorId, String studentId, String bookingId) throws Exception {
        requiredNotBlank(tutorId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(studentId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(bookingId, ErrorCode.INVALID_REQUEST);

        int relationCount = tutorMessageMapper.countTutorStudentBookingRelation(tutorId, studentId, bookingId);
        require(relationCount > 0, ErrorCode.FORBIDDEN);

        return tutorMessageMapper.selectThreadByTutorAndStudent(tutorId, studentId, bookingId);
    }

    @Override
    public boolean isReplyWritable(String studentId, String tutorId, String bookingId) throws Exception {
        requiredNotBlank(studentId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(tutorId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(bookingId, ErrorCode.INVALID_REQUEST);
        return tutorMessageMapper.countStudentWritableRelation(tutorId, studentId, bookingId) > 0;
    }

    private void insertMessage(String tutorId, String studentId, String bookingId, String content, String senderRole) throws Exception {
        requiredNotBlank(tutorId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(studentId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(bookingId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(content, ErrorCode.INVALID_REQUEST);

        String trimmedContent = content.trim();
        require(trimmedContent.length() <= 1000, ErrorCode.INVALID_REQUEST);

        if ("STUDENT".equals(senderRole)) {
            int writableCount = tutorMessageMapper.countStudentWritableRelation(tutorId, studentId, bookingId);
            if (writableCount <= 0) {
                throw new AppException(ErrorCode.FORBIDDEN, "수업 종료 후에는 학생 메시지 작성이 불가합니다.");
            }
        } else {
            int paidRelationCount = tutorMessageMapper.countConfirmedPaidRelation(tutorId, studentId, bookingId);
            if (paidRelationCount <= 0) {
                throw new AppException(ErrorCode.FORBIDDEN, "해당 수업이 확정/결제 완료 상태일 때만 메시지를 보낼 수 있습니다.");
            }
        }

        TutorMessage tutorMessage = new TutorMessage();
        tutorMessage.setBookingId(bookingId);
        tutorMessage.setTutorId(tutorId);
        tutorMessage.setStudentId(studentId);
        tutorMessage.setSenderRole(senderRole);
        tutorMessage.setContent(trimmedContent);

        tutorMessageMapper.insert(tutorMessage);
        log.info("[튜터 메시지 저장] role: {}, tutorId: {}, studentId: {}", senderRole, tutorId, studentId);
    }
}

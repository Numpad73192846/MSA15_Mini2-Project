package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorStudentNote;
import com.aloha.teamproject.mapper.TutorStudentNoteMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorStudentNoteServiceImpl extends BaseServiceImpl implements TutorStudentNoteService {

    private final TutorStudentNoteMapper tutorStudentNoteMapper;

    @Override
    public void saveNote(String tutorId, String studentId, String progress, String notes) throws Exception {
        requiredNotBlank(tutorId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(studentId, ErrorCode.INVALID_REQUEST);

        int relationCount = tutorStudentNoteMapper.countTutorStudentBookingRelation(tutorId, studentId);
        require(relationCount > 0, ErrorCode.FORBIDDEN);

        String normalizedProgress = progress == null ? "" : progress.trim();
        String normalizedNotes = notes == null ? "" : notes.trim();

        require(normalizedProgress.length() <= 2000, ErrorCode.INVALID_REQUEST);
        require(normalizedNotes.length() <= 2000, ErrorCode.INVALID_REQUEST);

        TutorStudentNote note = new TutorStudentNote();
        note.setTutorId(tutorId);
        note.setStudentId(studentId);
        note.setProgress(normalizedProgress);
        note.setNotes(normalizedNotes);

        tutorStudentNoteMapper.upsert(note);
        log.info("[학생 노트 저장] tutorId: {}, studentId: {}", tutorId, studentId);
    }

    @Override
    public List<TutorStudentNote> selectByTutorId(String tutorId) throws Exception {
        requiredNotBlank(tutorId, ErrorCode.INVALID_REQUEST);
        return tutorStudentNoteMapper.selectByTutorId(tutorId);
    }
}

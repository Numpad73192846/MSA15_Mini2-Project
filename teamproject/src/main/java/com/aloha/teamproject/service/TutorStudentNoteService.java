package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.TutorStudentNote;

public interface TutorStudentNoteService {

    void saveNote(String tutorId, String studentId, String progress, String notes) throws Exception;

    List<TutorStudentNote> selectByTutorId(String tutorId) throws Exception;
}

package com.aloha.teamproject.service;

public interface AiAssistantService {

    String generateLessonSummary(
            String tutorName,
            String studentName,
            String subject,
            String lessonContext) throws Exception;

    String generateHomework(
            String tutorName,
            String studentName,
            String subject,
            String lessonContext) throws Exception;
}


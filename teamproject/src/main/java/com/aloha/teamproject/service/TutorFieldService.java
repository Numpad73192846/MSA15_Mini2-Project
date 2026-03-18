package com.aloha.teamproject.service;

import java.util.List;

public interface TutorFieldService {

    boolean replaceFields(String userId, List<String> fieldIds) throws Exception;
}

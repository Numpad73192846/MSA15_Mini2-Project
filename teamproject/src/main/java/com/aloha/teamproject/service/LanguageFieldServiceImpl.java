package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.dto.LanguageField;
import com.aloha.teamproject.mapper.LanguageFieldMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LanguageFieldServiceImpl implements LanguageFieldService {

    private final LanguageFieldMapper languageFieldMapper;

    @Override
    public List<LanguageField> list() throws Exception {
        return languageFieldMapper.list();
    }
}

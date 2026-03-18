package com.aloha.teamproject.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.aloha.teamproject.config.OpenAiProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {

    private final OpenAiProperties openAiProperties;
    private final RestTemplate restTemplate;

    @Override
    public String generateLessonSummary(
            String tutorName,
            String studentName,
            String subject,
            String lessonContext) throws Exception {

        if (lessonContext == null || lessonContext.trim().isEmpty()) {
            throw new IllegalArgumentException("요약할 수업 내용이 없습니다.");
        }

        String systemPrompt = """
        너는 언어 학습자를 위한 '복습 노트 정리 코치'다.
        학습자는 수업 직후 이 요약지를 보고 복습하고 말하기 연습을 한다.

        절대 규칙:
        - 수업 메모 원문에 있는 내용만 기반으로 작성 (추측 금지).
        - 없는 표현/문법을 새로 만들지 말 것.
        - 과장/감정 표현 금지. 학습용 자료처럼 작성.
        - 출력은 반드시 Markdown 형식만.
        - 아래 '복습 요약 템플릿' 구조를 정확히 지켜라.
        - 불필요한 인사말/설명 문장 금지.

        복습 요약 템플릿 (반드시 동일하게 출력):

        # 📘 수업 복습 노트
        - 튜터: {tutorName}
        - 학습자: {studentName}
        - 수업 주제: {subject}

        ---

        ## 1) 오늘 수업 핵심 요약 (3~5줄)
        - 
        - 
        - 

        ## 2) 오늘 배운 핵심 표현/문법
        | 표현/문법 | 의미 | 예문(수업 기반) |
        |---|---|---|
        |  |  |  |
        |  |  |  |
        |  |  |  |

        규칙:
        - 예문은 수업 메모에 나온 내용 기반으로.
        - 길게 쓰지 말 것.

        ## 3) 내가 헷갈릴 수 있는 포인트
        - 
        - 
        - 

        ## 4) 실전 말하기 적용 예시 (짧은 대화 1개)
        A:
        B:
        A:
        B:

        ## 5) 오늘 수업 한 줄 정리
        👉 

        ## 6) 다음 수업 전 복습 체크리스트
        - ☐ 핵심 표현 3번 소리내어 읽기
        - ☐ 예문 3개 직접 말해보기
        - ☐ 헷갈린 부분 다시 정리
        - ☐ 다음 시간 질문 2개 준비

        출력 시 주의:
        - 섹션 제목, 표, 체크박스 형식 그대로 유지.
        - 수업 메모에 정보가 부족한 칸은 '수업 메모에 정보 없음'이라고 적어라.
        - 추가 설명 문장 금지.
        """;

        String userPrompt = buildLessonSummaryPrompt(tutorName, studentName, subject, lessonContext);
        String aiText = requestOpenAi(systemPrompt, userPrompt);

        if (aiText == null || aiText.isBlank()) {
            return buildFallbackLessonSummary(subject, lessonContext);
        }
        return aiText.trim();
    }

    @Override
    public String generateHomework(
        String tutorName,
        String studentName,
        String subject,
        String lessonContext
    ) throws Exception {

        if (lessonContext == null || lessonContext.trim().isEmpty()) {
            throw new IllegalArgumentException("과제를 생성할 수업 내용이 없습니다.");
        }

        String systemPrompt = """
        너는 한국어로 숙제지를 작성하는 '언어 튜터'다.
        학습자는 수업 직후 이 숙제지를 그대로 따라하면 된다.

        절대 규칙:
        - 수업 메모 원문에 있는 내용만 기반으로 작성(추측/새 주제 추가 금지).
        - 과장/불필요한 멘트 금지. 짧고 실용적으로.
        - 출력은 반드시 Markdown만. (HTML, 코드블록 제외)
        - 아래 '숙제지 템플릿' 구조/기호/순서를 반드시 지켜라.
        - 체크박스는 반드시 '☐' 로 시작.
        - 예문/문장/대화는 따옴표 없이 그대로 쓰고, 한 줄에 하나씩.

        숙제지 템플릿(반드시 동일하게 출력):
        # 📝 숙제지 (Language Homework)
        - 튜터: {tutorName}
        - 학습자: {studentName}
        - 수업 주제: {subject}
        - 목표: (1줄)
        - 총 소요시간: (분 단위)

        ---

        ## 1) 오늘 배운 핵심 정리 (3줄)
        - 
        - 
        - 

        ## 2) 핵심 표현/단어 (표)
        | 표현/단어 | 뜻(한국어) | 예문(학습자 문장) |
        |---|---|---|
        |  |  |  |
        |  |  |  |
        |  |  |  |
        |  |  |  |

        규칙:
        - '예문(학습자 문장)'은 학습자가 직접 따라 써볼 수 있게 쉬운 문장으로.

        ## 3) 문장 변환 훈련 (총 6문항)
        - 지시: 아래 기본문장을 (A)부정문, (B)의문문으로 바꾸세요.
        1) 기본: ...
        - A(부정): ...
        - B(의문): ...
        2) 기본: ...
        - A(부정): ...
        - B(의문): ...
        3) 기본: ...
        - A(부정): ...
        - B(의문): ...

        - 지시: 아래 문장을 '수업에서 배운 표현'을 써서 더 자연스럽게 바꾸세요.
        4) ...
        5) ...
        6) ...

        ## 4) 말하기/대화 연습 (2세트)
        - 지시: 아래 상황을 보고 30초씩 말해보세요. (녹음 권장)
        ### 세트 A
        - 상황: ...
        - 포함해야 할 표현(2개): ① ... ② ...
        - 내 말하기(학습자 작성): ☐ 작성함 ☐ 녹음함

        ### 세트 B
        - 상황: ...
        - 포함해야 할 표현(2개): ① ... ② ...
        - 내 말하기(학습자 작성): ☐ 작성함 ☐ 녹음함

        ## 5) 리스닝/쉐도잉 (선택, 10분)
        - 지시: 수업 메모에 나온 문장/대화를 3번 따라 읽고, 마지막 1번은 녹음하세요.
        - 쉐도잉 문장 3개:
        1) ...
        2) ...
        3) ...
        - 체크: ☐ 3회 따라읽기 ☐ 1회 녹음

        ## 6) 제출 체크리스트
        - ☐ 단어/표현 표 4개 채움
        - ☐ 문장 변환 6문항 완료
        - ☐ 말하기 2세트(작성 또는 녹음)
        - ☐ 질문 2개 준비

        ## 7) 다음 시간 질문(2개)
        - Q1.
        - Q2.

        출력 시 주의:
        - 표/번호/섹션 제목 그대로 유지.
        - 빈칸(...)은 수업 메모 기반으로 채워라.
        - 수업 메모가 부족하면, 해당 칸은 '수업 메모에 정보 없음'이라고 명시하고 넘어가라.
        """;

        String userPrompt = buildHomeworkPrompt(tutorName, studentName, subject, lessonContext);
        String aiText = requestOpenAi(systemPrompt, userPrompt);

        if (aiText == null || aiText.isBlank()) {
            return buildFallbackHomework(subject, lessonContext);
        }
        return aiText.trim();
    }

    private String requestOpenAi(String systemPrompt, String userPrompt) {
        String apiKey = openAiProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", openAiProperties.getModel());
            body.put("temperature", openAiProperties.getTemperature());
            body.put("max_tokens", openAiProperties.getMaxTokens());

            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));
            body.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(openAiProperties.getApiUrl(), entity, Map.class);
            return extractAssistantMessage(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.error("[AI] OpenAI 호출 실패 status={}, body={}", e.getStatusCode().value(), e.getResponseBodyAsString());

            if (e.getStatusCode().value() == 401) {
                log.error("[AI] Unauthorized. Check OPENAI_API_KEY / billing / project setting.");
            }
            
            if (e.getStatusCode().value() == 429) {
                log.error("[AI] Rate limited or quota exceeded.");
            }
            return null;
        } catch (Exception e) {
            log.error("[AI] OpenAI 호출 실패", e);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String extractAssistantMessage(Map responseBody) {
        if (responseBody == null) {
            return null;
        }

        Object choicesObj = responseBody.get("choices");
        if (!(choicesObj instanceof List<?> choices) || choices.isEmpty()) {
            return null;
        }

        Object firstChoiceObj = choices.get(0);
        if (!(firstChoiceObj instanceof Map<?, ?> firstChoice)) {
            return null;
        }

        Object messageObj = firstChoice.get("message");
        if (!(messageObj instanceof Map<?, ?> messageMap)) {
            return null;
        }

        Object contentObj = messageMap.get("content");
        if (!(contentObj instanceof String content)) {
            return null;
        }
        return content;
    }

    private String buildLessonSummaryPrompt(String tutorName, String studentName, String subject, String lessonContext) {
        String safeTutor = normalizeOrDefault(tutorName, "튜터");
        String safeStudent = normalizeOrDefault(studentName, "학습자");
        String safeSubject = normalizeOrDefault(subject, "수업");

    return """
            [메타 정보]
            tutorName=%s
            studentName=%s
            subject=%s

            [수업 메모 원문]
            %s

            요청:
            - 위 수업 메모를 기반으로 system 템플릿 형식 그대로 '복습 노트'를 작성해줘.
            - 원문에 없는 표현/문법을 새로 만들지 마.
            - 학습자가 복습하기 좋게 간결하게 정리해줘.
            """.formatted(safeTutor, safeStudent, safeSubject, lessonContext);
    }

    private String buildHomeworkPrompt(String tutorName, String studentName, String subject, String lessonContext) {
        String safeTutor = normalizeOrDefault(tutorName, "튜터");
        String safeStudent = normalizeOrDefault(studentName, "학습자");
        String safeSubject = normalizeOrDefault(subject, "수업");

    return """
            [메타 정보]
            tutorName=%s
            studentName=%s
            subject=%s

            [수업 메모 원문]
            %s

            요청:
            - system에 있는 '숙제지 템플릿' 형식 그대로 작성해줘.
            - 템플릿의 {tutorName},{studentName},{subject}는 위 메타 정보를 그대로 넣어줘.
            - 수업 메모에 없는 정보는 임의로 만들지 말고 '수업 메모에 정보 없음'으로 적어줘.
            """.formatted(safeTutor, safeStudent, safeSubject, lessonContext);
                }

    private String buildFallbackLessonSummary(String subject, String lessonContext) {
        String safeSubject = normalizeOrDefault(subject, "수업");
        String snippet = toSnippet(lessonContext, 280);
        return """
                [AI 수업 요약]
                과목/주제: %s

                1) 오늘 수업 핵심 요약
                - %s

                2) 학습 포인트
                - 핵심 개념을 문장으로 다시 설명해보기
                - 오늘 다룬 표현/문법을 예문에 적용해보기
                - 헷갈린 지점을 체크하고 질문 목록 만들기

                3) 다음 수업 전 복습 체크리스트
                - 수업 노트 1회 정독
                - 주요 포인트 3개 암기/정리
                - 다음 수업 질문 2개 준비
                """.formatted(safeSubject, snippet);
    }

    private String buildFallbackHomework(String subject, String lessonContext) {
        String safeSubject = normalizeOrDefault(subject, "수업");
        String snippet = toSnippet(lessonContext, 220);
        return """
                [AI 과제 초안]
                과목/주제: %s

                1) 과제 목표
                - 오늘 수업에서 다룬 핵심 개념을 스스로 설명할 수 있도록 연습합니다.
                - 수업 내용을 실제 문제 풀이/문장 작성에 적용합니다.

                2) 과제 목록
                1. 핵심 개념 요약 노트 작성
                - 설명: 오늘 수업 내용을 10줄 내로 정리
                - 제출 형태: 텍스트
                - 권장 시간: 15분

                2. 적용 문제/문장 5개 작성
                - 설명: 수업 내용(참고: %s)을 적용한 예시 만들기
                - 제출 형태: 텍스트
                - 권장 시간: 20분

                3. 오답/헷갈린 포인트 정리
                - 설명: 어려웠던 부분 3개와 이유 작성
                - 제출 형태: 체크리스트 + 짧은 메모
                - 권장 시간: 10분

                3) 평가 기준
                - 핵심 개념을 정확히 이해했는지
                - 예시/문제 적용이 적절한지
                - 헷갈린 포인트를 구체적으로 정리했는지
                """.formatted(safeSubject, snippet);
    }

    private String normalizeOrDefault(String value, String fallback) {
        if (value == null) return fallback;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private String toSnippet(String text, int maxLength) {
        if (text == null || text.isBlank()) {
            return "수업 핵심 내용을 기반으로 요약이 생성되었습니다.";
        }
        String normalized = text.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= maxLength) {
            return normalized;
        }
        return normalized.substring(0, maxLength) + "...";
    }
}


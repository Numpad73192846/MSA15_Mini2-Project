package com.aloha.teamproject.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorAvailability;
import com.aloha.teamproject.dto.TutorTimeRange;
import com.aloha.teamproject.mapper.TutorAvailabilityMapper;
import com.aloha.teamproject.mapper.TutorTimeRangeMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorAvailabilityServiceImpl extends BaseServiceImpl implements TutorAvailabilityService {

    private final TutorAvailabilityMapper tutorAvailabilityMapper;
    private final TutorTimeRangeMapper tutorTimeRangeMapper;

    @Override
    @Transactional
    public List<TutorAvailability> selectByUserIdAndDateRange(
            String userId,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        requireNotNull(startDate, ErrorCode.INVALID_REQUEST);
        requireNotNull(endDate, ErrorCode.INVALID_REQUEST);

        List<TutorAvailability> availabilities =
                tutorAvailabilityMapper.selectByUserIdAndDateRange(userId, startDate, endDate);

        boolean seeded = seedAvailabilityFromTimeRanges(userId, startDate, endDate, availabilities);
        if (seeded) {
            return tutorAvailabilityMapper.selectByUserIdAndDateRange(userId, startDate, endDate);
        }
        return availabilities;
    }

    @Override
    public TutorAvailability selectById(String id) throws Exception {
        requiredNotBlank(id, ErrorCode.INVALID_REQUEST);
        return tutorAvailabilityMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean replaceAvailabilities(
            String userId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            List<TutorAvailability> availabilities
    ) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        requireNotNull(startDate, ErrorCode.INVALID_REQUEST);
        requireNotNull(endDate, ErrorCode.INVALID_REQUEST);
        requireNotNull(availabilities, ErrorCode.INVALID_REQUEST);

        tutorAvailabilityMapper.deleteOpenWithoutBookingByUserIdAndDateRange(userId, startDate, endDate);

        if (!availabilities.isEmpty()) {
            availabilities.forEach(av -> av.setUserId(userId));
            tutorAvailabilityMapper.insertBatch(availabilities);
        }

        return true;
    }

    @Override
    public boolean updateStatus(String id, String status) throws Exception {
        requiredNotBlank(id, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(status, ErrorCode.INVALID_REQUEST);

        int result = tutorAvailabilityMapper.updateStatus(id, status);
        return result > 0;
    }

    @Override
    public boolean updateRangeAndStatus(String id, LocalDateTime startAt, LocalDateTime endAt, String status) throws Exception {
        requiredNotBlank(id, ErrorCode.INVALID_REQUEST);
        requireNotNull(startAt, ErrorCode.INVALID_REQUEST);
        requireNotNull(endAt, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(status, ErrorCode.INVALID_REQUEST);

        int result = tutorAvailabilityMapper.updateRangeAndStatus(id, startAt, endAt, status);
        return result > 0;
    }

    @Override
    public boolean updateStatusBatch(List<String> ids, String status) throws Exception {
        requireNotNull(ids, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(status, ErrorCode.INVALID_REQUEST);
        if (ids.isEmpty()) {
            return true;
        }

        int result = tutorAvailabilityMapper.updateStatusBatch(ids, status);
        return result > 0;
    }

    @Override
    public boolean deleteById(String id) throws Exception {
        requiredNotBlank(id, ErrorCode.INVALID_REQUEST);

        int result = tutorAvailabilityMapper.deleteById(id);
        return result > 0;
    }

    private boolean seedAvailabilityFromTimeRanges(
            String userId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            List<TutorAvailability> existingAvailabilities
    ) throws Exception {
        List<TutorAvailability> existing = existingAvailabilities == null
                ? java.util.List.of()
                : existingAvailabilities.stream()
                        .filter(Objects::nonNull)
                        .toList();

        // Do not auto-fill missing slots when user-managed data already exists.
        if (!existing.isEmpty()) {
            return false;
        }

        List<TutorTimeRange> timeRanges = tutorTimeRangeMapper.selectByUserId(userId);
        if (timeRanges == null || timeRanges.isEmpty()) {
            return false;
        }

        final int stepMinutes = 30;
        LocalDate startDay = startDate.toLocalDate();
        LocalDate endDay = endDate.toLocalDate();
        List<TutorAvailability> generated = new java.util.ArrayList<>();

        for (LocalDate day = startDay; !day.isAfter(endDay); day = day.plusDays(1)) {
            DayOfWeek javaDay = day.getDayOfWeek();

            for (TutorTimeRange range : timeRanges) {
                DayOfWeek rangeDay = toJavaDayOfWeek(range.getDayOfWeek());
                if (rangeDay == null || rangeDay != javaDay) {
                    continue;
                }

                LocalTime startTime = range.getStartAt();
                LocalTime endTime = range.getEndAt();
                if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
                    continue;
                }

                for (LocalDateTime slotStart = day.atTime(startTime);
                     slotStart.plusMinutes(stepMinutes).compareTo(day.atTime(endTime)) <= 0;
                     slotStart = slotStart.plusMinutes(stepMinutes)) {
                    LocalDateTime slotEnd = slotStart.plusMinutes(stepMinutes);
                    if (!(slotStart.isBefore(endDate) && slotEnd.isAfter(startDate))) {
                        continue;
                    }

                    TutorAvailability availability = new TutorAvailability();
                    availability.setUserId(userId);
                    availability.setStartAt(slotStart);
                    availability.setEndAt(slotEnd);
                    availability.setStatus(TutorAvailability.Status.OPEN);
                    generated.add(availability);
                }
            }
        }

        if (!generated.isEmpty()) {
            List<TutorAvailability> deduplicated = generated.stream()
                    .filter(Objects::nonNull)
                    .collect(java.util.stream.Collectors.collectingAndThen(
                            java.util.stream.Collectors.toMap(
                                    item -> item.getStartAt() + "|" + item.getEndAt(),
                                    item -> item,
                                    (left, right) -> left,
                                    java.util.LinkedHashMap::new
                            ),
                            map -> new java.util.ArrayList<>(map.values())
                    ));
            tutorAvailabilityMapper.insertBatch(deduplicated);
            return true;
        }

        return false;
    }

    private DayOfWeek toJavaDayOfWeek(TutorTimeRange.DayOfWeek dayOfWeek) {
        if (dayOfWeek == null) {
            return null;
        }

        return switch (dayOfWeek) {
            case MON -> DayOfWeek.MONDAY;
            case TUE -> DayOfWeek.TUESDAY;
            case WED -> DayOfWeek.WEDNESDAY;
            case THU -> DayOfWeek.THURSDAY;
            case FRI -> DayOfWeek.FRIDAY;
            case SAT -> DayOfWeek.SATURDAY;
            case SUN -> DayOfWeek.SUNDAY;
        };
    }
}

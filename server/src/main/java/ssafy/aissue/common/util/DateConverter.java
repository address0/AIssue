package ssafy.aissue.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateConverter {

    // LocalDate 형식인 경우만 변환 (start_at 변환, 시간은 00:00:00)
    public static LocalDateTime convertStartAtToLocalDateTime(String dateStr) {
        if (dateStr == null) {
            return null;  // null일 경우 그대로 반환 (혹은 기본값 설정 가능)
        }

        if (isLocalDate(dateStr)) {
            // LocalDate 형식일 경우만 변환
            LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return localDate.atStartOfDay();  // 시작 시간을 00:00:00으로 변환
        } else {
            // LocalDateTime 형식이면 그대로 반환
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
    }

    // LocalDate 형식인 경우만 변환 (end_at 변환, 시간은 23:59:59)
    public static LocalDateTime convertEndAtToLocalDateTime(String dateStr) {
        if (dateStr == null) {
            return null;  // null일 경우 그대로 반환 (혹은 기본값 설정 가능)
        }

        if (isLocalDate(dateStr)) {
            // LocalDate 형식일 경우만 변환
            LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return localDate.atTime(23, 59, 59);  // 끝 시간을 23:59:59으로 변환
        } else {
            // LocalDateTime 형식이면 그대로 반환
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
    }

    // 주어진 문자열이 LocalDate 형식인지 확인하는 함수
    private static boolean isLocalDate(String dateStr) {
        if (dateStr == null) {
            return false;  // null인 경우 LocalDate 형식이 아님
        }
        try {
            LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return true;  // LocalDate 형식이면 true
        } catch (DateTimeParseException e) {
            return false;  // LocalDate 형식이 아니면 false
        }
    }

}

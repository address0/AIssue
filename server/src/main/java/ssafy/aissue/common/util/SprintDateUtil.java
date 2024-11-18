package ssafy.aissue.common.util;

import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;

public class SprintDateUtil {

    public SprintDates calculateSprintDates() {
        // 1. 현재 날짜 기준으로 시작일 계산 (오늘 날짜)
        LocalDate now = LocalDate.now();

        // 2. 이번 주 금요일 계산
        LocalDate friday = getFridayOfCurrentWeek(now);

        // 3. 금요일의 오후 6시로 설정 (ZonedDateTime 사용)
        ZonedDateTime endDate = friday.atTime(9, 0).atZone(ZoneOffset.UTC); // 오후 6시 (18:00) UTC

        // 4. 현재 날짜의 ZonedDateTime 설정 (ZonedDateTime 사용)
        ZonedDateTime startDate = ZonedDateTime.now(ZoneOffset.UTC); // 현재 시간 UTC

        // 스프린트 시작일과 종료일 반환
        return new SprintDates(startDate, endDate);
    }

    private LocalDate getFridayOfCurrentWeek(LocalDate startDate) {
        // 이번 주 금요일을 계산 (현재 날짜가 금요일이면 그 날, 아니면 이번 주 금요일)
        return startDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY));
    }

    @Getter
    public static class SprintDates {
        private final ZonedDateTime startDate;
        private final ZonedDateTime endDate;

        public SprintDates(ZonedDateTime startDate, ZonedDateTime endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }

    }
}

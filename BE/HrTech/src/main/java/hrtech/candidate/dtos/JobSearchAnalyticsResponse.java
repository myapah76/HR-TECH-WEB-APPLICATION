package hrtech.candidate.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobSearchAnalyticsResponse {

    private List<FunnelStageDto> funnelData;
    private List<ChartItemDto> weeklyData;
    private List<ChartItemDto> monthlyData;
    private List<ChartItemDto> yearlyData;

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FunnelStageDto {
        private String stage;
        private long count;
        private double percent;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartItemDto {
        private String label;
        private long count;
    }
}

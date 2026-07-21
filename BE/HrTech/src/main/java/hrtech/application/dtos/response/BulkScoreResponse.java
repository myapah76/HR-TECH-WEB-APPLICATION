package hrtech.application.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkScoreResponse {

    /** Tổng số application đã được chấm điểm trong lần này. */
    private int totalScored;

    /** Số application bị tự động từ chối (dưới threshold, autoReject = true). */
    private int autoRejectedCount;

    /** Số application đạt ngưỡng (>= threshold). */
    private int aboveThresholdCount;

    /** Số application đã chấm điểm rồi từ trước (bỏ qua). */
    private int alreadyScoredCount;

    /** Số application không thể chấm điểm (lỗi thiếu CV/skill). */
    private int failedCount;

    /** Toàn bộ kết quả sau khi chấm (bao gồm cả đã scored trước đó). */
    private List<ApplicationSummaryResponse> allApplications;
}

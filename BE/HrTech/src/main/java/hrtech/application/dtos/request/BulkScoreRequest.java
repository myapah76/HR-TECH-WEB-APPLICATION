package hrtech.application.dtos.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BulkScoreRequest {

    /**
     * Ngưỡng điểm tối thiểu (%) để ứng viên được duyệt qua.
     * Mặc định 60 (%).
     */
    @Min(0)
    @Max(100)
    private int thresholdPercent = 60;

    /**
     * Nếu true: BE tự động từ chối ngay các application dưới thresholdPercent.
     * Nếu false: Chỉ chấm điểm, HR tự chọn từ chối sau.
     */
    private boolean autoRejectBelowThreshold = false;
}

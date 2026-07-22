package hrtech.application.dtos.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSlotDto {
    private UUID id;

    @NotNull(message = "Thời gian bắt đầu khung giờ phỏng vấn không được để trống!")
    private Instant startTime;

    @NotNull(message = "Thời gian kết thúc khung giờ phỏng vấn không được để trống!")
    private Instant endTime;

    private String location;
    private String meetingLink;
    private Boolean isSelected;
    private Boolean isNewSlot;

    @AssertTrue(message = "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!")
    public boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) return true;
        return endTime.isAfter(startTime);
    }

    @AssertTrue(message = "Mỗi khung giờ phỏng vấn chỉ được chọn Địa điểm (Offline) HOẶC Link Google Meet (Online), không được chọn cả 2 hoặc để trống!")
    public boolean isValidLocationOrMeetingLink() {
        boolean hasLoc = location != null && !location.isBlank();
        boolean hasMeet = meetingLink != null && !meetingLink.isBlank();
        return (hasLoc ^ hasMeet);
    }
}

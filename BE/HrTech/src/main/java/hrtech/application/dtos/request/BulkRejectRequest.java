package hrtech.application.dtos.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class BulkRejectRequest {

    /**
     * Danh sách applicationId HR chọn để từ chối thủ công.
     */
    @NotEmpty(message = "Danh sách application không được rỗng")
    private List<UUID> applicationIds;
}

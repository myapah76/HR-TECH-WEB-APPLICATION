package hrtech.application.entities.enums;

public enum InterviewRoundStatus {
    NOT_STARTED,           // Chưa bắt đầu / Chưa xếp lịch
    SLOTS_SENT,            // Đã gửi danh sách khung giờ -> Chờ ứng viên chọn
    RESCHEDULE_REQUESTED,  // Ứng viên đề xuất đổi lịch khác kèm lý do
    RESCHEDULE_REJECTED,   // HR từ chối đề xuất đổi lịch & gửi khung giờ thay thế
    CONFIRMED,             // Đã chốt lịch phỏng vấn chính thức
    ATTENDED,              // Ứng viên đã tham gia phỏng vấn
    PASSED,                // Đã ĐẠT vòng phỏng vấn này
    FAILED,                // KHÔNG ĐẠT vòng phỏng vấn này
    TERMINATED,            // Hết luồng do quá 3 lần đổi lịch không thành công
    INTERVIEW_COMPLETED    // Hoàn thành tất cả các vòng phỏng vấn
}

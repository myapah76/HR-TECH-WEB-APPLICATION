package hrtech.identity.entities;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import hrtech.application.entities.Application;
import hrtech.company.entities.CompanyMember;
import hrtech.cv.entities.Cv;
import hrtech.shared.common.SoftDeleteEntity;
import hrtech.subscription.entities.CandidateSubscription;
import hrtech.subscription.entities.CompanySubscription;
import hrtech.payment.entities.Payment;

@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET is_deleted = true WHERE id = ?")
// Tự động loại bỏ các bản ghi đã soft delete khỏi các query
@SQLRestriction("is_deleted = false")
@Getter
@Setter
public class User extends SoftDeleteEntity {

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true)
    private String email;

    private String username;

    private String password;

    private String phone;

    private String address;

    private Integer gender; // 0 - Male, 1 - Female

    @Column(name = "date_of_birth")
    private Instant dateOfBirth;

    @Column(name = "is_blocked")
    private Boolean isBlocked = false;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "avatar_public_id")
    private String avatarPublicId;

    @Column(name = "require_password_change")
    private Boolean requirePasswordChange = false;

    @Column(name = "ai_credit_balance", nullable = false)
    private Integer aiCreditBalance = 0;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    //Sử dụng REMOVE và orphanRemoval xóa lịch sử ứng tuyển, đăng ký gói dịch vụ hoặc thanh toán.

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cv> cvs = new ArrayList<>();

    /*
     * PERSIST: lưu các entity con khi tạo mới User.
     * MERGE: cập nhật các entity con khi cập nhật User.
     */
    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<CandidateSubscription> candidateSubscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "purchasedBy", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<CompanySubscription> companyPurchasedSubscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanyMember> companyMembers = new ArrayList<>();
}

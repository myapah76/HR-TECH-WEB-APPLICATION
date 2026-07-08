package hrtech.identity.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import hrtech.shared.common.SoftDeleteEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "roles")

// Soft delete: thay vì DELETE sẽ update deleted = true
@SQLDelete(sql = "UPDATE roles SET is_deleted = true WHERE id = ?")

// Tự động loại bỏ các bản ghi đã soft delete khỏi các query
@SQLRestriction("is_deleted = false")
public class Role extends SoftDeleteEntity {

    private String name;

    @Column(unique = true)
    private String slug;

    private String description;

    @OneToMany(
            mappedBy = "role",
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            }
    )
    /*
     * PERSIST:
     * Khi tạo mới Role và lưu Role xuống DB,
     * các User mới được gắn vào Role cũng sẽ được lưu tự động.
     * MERGE:
     * Khi cập nhật Role, các thay đổi trên User thuộc Role
     * cũng sẽ được đồng bộ xuống DB.
     */
    private List<User> users = new ArrayList<>();
}
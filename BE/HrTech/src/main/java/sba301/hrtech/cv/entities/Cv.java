package sba301.hrtech.cv.entities;

import sba301.hrtech.auth.entities.User;
import sba301.hrtech.shared.common.SoftDeleteEntity;
import java.util.List;
import java.util.ArrayList;
import sba301.hrtech.application.entities.Application;
import sba301.hrtech.cv.entities.CvSkill;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cv extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(name = "file_url")
    private String fileUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_content", columnDefinition = "jsonb")
    private String parsedContent;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CvSkill> cvSkills = new ArrayList<>();
}







package sba301.hrtech.cv.entities;

import sba301.hrtech.identity.entities.User;
import sba301.hrtech.shared.common.SoftDeleteEntity;
import sba301.hrtech.shared.enums.ExtractionStatus;
import java.util.List;
import sba301.hrtech.application.entities.Application;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE cvs SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Cv extends SoftDeleteEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "parsed_content", columnDefinition = "text")
    private String parsedContent;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Enumerated(EnumType.STRING)
    @Column(name = "extraction_status")
    private ExtractionStatus extractionStatus;

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications;

    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CvSkill> cvSkills;
}

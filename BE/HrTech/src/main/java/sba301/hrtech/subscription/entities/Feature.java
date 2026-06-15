package sba301.hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import sba301.hrtech.shared.common.SoftDeleteEntity;

@Entity
@Table(name = "features")
@Getter
@Setter
@SQLDelete(sql = "UPDATE features SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Feature extends SoftDeleteEntity {

    @Column(unique = true)
    private String code;

    private String name;

    private String description;

}
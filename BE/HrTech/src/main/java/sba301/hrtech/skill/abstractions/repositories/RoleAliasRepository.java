package sba301.hrtech.skill.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import sba301.hrtech.skill.entities.RoleAlias;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleAliasRepository extends JpaRepository<RoleAlias, UUID> {
    Optional<RoleAlias> findByAliasIgnoreCase(String alias);

    @Query("SELECT DISTINCT r.canonicalRole FROM RoleAlias r")
    List<String> findDistinctCanonicalRoles();
}

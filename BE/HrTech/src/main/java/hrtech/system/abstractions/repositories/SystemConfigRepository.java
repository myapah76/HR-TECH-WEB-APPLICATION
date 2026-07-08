package hrtech.system.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import hrtech.system.entities.SystemConfig;
import java.util.UUID;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, UUID> {
    // Truy vấn Native SQL lấy dung lượng cơ sở dữ liệu PostgreSQL đã format
    @Query(value = "SELECT pg_size_pretty(pg_database_size(current_database()))", nativeQuery = true)
    String getDatabaseSize();
}

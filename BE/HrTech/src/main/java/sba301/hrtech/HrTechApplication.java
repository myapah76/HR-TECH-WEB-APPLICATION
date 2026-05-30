package sba301.hrtech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HrTechApplication {

    public static void main(String[] args) {
        SpringApplication.run(HrTechApplication.class, args);
    }

}

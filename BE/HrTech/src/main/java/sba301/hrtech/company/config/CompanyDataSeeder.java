package sba301.hrtech.company.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.enums.CompanySize;
import sba301.hrtech.company.entities.enums.CompanyStatus;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class CompanyDataSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (companyRepository.count() == 0) {
            log.info("Seeding dummy company data for testing...");

            Company company1 = Company.builder()
                    .name("FPT Software")
                    .description("Top IT Company in Vietnam. Leading provider of technology and IT services.")
                    .industry("Information Technology")
                    .size(CompanySize.ENTERPRISE)
                    .address("F-Town, HCMC")
                    .status(CompanyStatus.APPROVED)
                    .taxCode("0301234567")
                    .website("https://fptsoftware.com")
                    .logoUrl("https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg")
                    .build();

            Company company2 = Company.builder()
                    .name("VNG Corporation")
                    .description("Leading tech company in Vietnam. We believe in the power of the Internet to change lives.")
                    .industry("Internet")
                    .size(CompanySize.ENTERPRISE)
                    .address("Z06, HCMC")
                    .status(CompanyStatus.APPROVED)
                    .taxCode("0301234568")
                    .website("https://vng.com.vn")
                    .logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/VNG_logo.svg/1200px-VNG_logo.svg.png")
                    .build();

            companyRepository.saveAll(List.of(company1, company2));
            log.info("2 Companies seeded successfully. Please check the DB to get their IDs for testing.");
        }
    }
}

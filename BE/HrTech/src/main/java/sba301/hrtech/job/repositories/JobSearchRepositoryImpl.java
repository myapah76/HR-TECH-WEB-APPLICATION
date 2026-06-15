package sba301.hrtech.job.repositories;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import sba301.hrtech.job.abstractions.repositories.JobSearchCustomRepository;
import sba301.hrtech.job.entities.JobDocument;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class JobSearchRepositoryImpl implements JobSearchCustomRepository {

    private final ElasticsearchClient client;

    @Override
    public Page<JobDocument> search(String keyword, Pageable pageable) {

        return getJobDocuments(keyword, pageable, client);
    }

    @NotNull
    public static Page<JobDocument> getJobDocuments(String keyword, Pageable pageable, ElasticsearchClient client) {
        try {
            Query query = Query.of(q -> q
                    .multiMatch(m -> m
                            .query(keyword)
                            .fields("title^3", "skills^2", "description", "location", "jobType", "experienceLevel")
                    )
            );

            SearchResponse<JobDocument> response = client.search(s -> s
                            .index("jobs")
                            .query(query)
                            .from((int) pageable.getOffset())
                            .size(pageable.getPageSize())
                            .sort(so -> so
                                    .field(f -> f
                                            .field("createdAt")
                                            .order(co.elastic.clients.elasticsearch._types.SortOrder.Desc)
                                    )
                            ),
                    JobDocument.class
                    );
            List<JobDocument> content =
                    response.hits().hits().stream()
                            .map(hit -> hit.source())
                            .toList();

            return new PageImpl<>(content, pageable, response.hits().total().value());

        } catch (Exception e) {
            throw new AppException(ErrorCode.ELASTIC_SEARCH_FAILED, "Elasticsearch search failed");
        }
    }
}

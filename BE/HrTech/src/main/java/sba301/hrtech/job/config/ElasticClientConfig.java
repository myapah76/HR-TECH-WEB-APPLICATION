package sba301.hrtech.job.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.elasticsearch.client.RestClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticClientConfig {

    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient) {
        // 1. Create a custom ObjectMapper and register the Java Time Module
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        // 2. Pass this customized object mapper to the JsonpMapper
        JacksonJsonpMapper jsonpMapper = new JacksonJsonpMapper(objectMapper);

        // 3. Build the transport layer and client
        RestClientTransport transport = new RestClientTransport(restClient, jsonpMapper);
        return new ElasticsearchClient(transport);
    }
}
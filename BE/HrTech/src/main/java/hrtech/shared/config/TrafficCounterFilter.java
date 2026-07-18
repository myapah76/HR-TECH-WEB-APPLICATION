package hrtech.shared.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class TrafficCounterFilter implements Filter {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REDIS_VISITS_PREFIX = "traffic:visits:";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public TrafficCounterFilter(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest) {
            String path = httpRequest.getRequestURI();
            String method = httpRequest.getMethod();

            if (path.startsWith("/api")
                    && !method.equalsIgnoreCase("OPTIONS")
                    && !path.contains("/admin/dashboard")
                    && !path.contains("/swagger")
                    && !path.contains("/v3/api-docs")) {

                String todayStr = LocalDate.now().format(DATE_FORMATTER);
                String redisKey = REDIS_VISITS_PREFIX + todayStr;
                try {
                    redisTemplate.opsForValue().increment(redisKey);
                } catch (Exception e) {

                }
            }
        }
        chain.doFilter(request, response);
    }
}

package sba301.hrtech.notification.services.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
import sba301.hrtech.notification.abstractions.cache.IRedisOtpService;

import java.util.Collections;
@Service
@RequiredArgsConstructor
public class RedisOtpServiceImpl implements IRedisOtpService {

    private final RedisTemplate<String, String> redisTemplate;
    private final RedisScript<Long> saveOtpScript;
    private final RedisScript<Long> validateOtpScript;


    private static final String PREFIX = "otp:";
    private static final long OTP_TTL_MINUTES = 5;

    @Override
    public boolean saveOtp(String email, String otp) {
        String key = PREFIX + email;

        Long result = redisTemplate.execute(
                saveOtpScript,
                Collections.singletonList(key),
                otp,
                String.valueOf(OTP_TTL_MINUTES * 60)
        );

        return result == 1;
    }

    @Override
    public String getOtp(String email) {
        return (String) redisTemplate.opsForValue().get(PREFIX + email);
    }

    @Override
    public void deleteOtp(String email) {
        redisTemplate.delete(PREFIX + email);
    }

    @Override
    public boolean validateOtp(String email, String inputOtp) {
        String key = PREFIX + email;

        Long result = redisTemplate.execute(
                validateOtpScript,
                Collections.singletonList(key),
                inputOtp
        );

        return result == 1;
    }
}

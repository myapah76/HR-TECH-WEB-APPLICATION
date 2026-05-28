local key = KEYS[1]
local otp = ARGV[1]
local ttl = tonumber(ARGV[2])

-- only set if not exists
if redis.call("EXISTS", key) == 0 then
    redis.call("SET", key, otp)
    redis.call("EXPIRE", key, ttl)
    return 1
else
    return 0
end
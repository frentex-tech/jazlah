/**
 * Lua run atomically in Redis by RedisThrottlerStorage: counts one request in a fixed
 * window and blocks the client once the count goes over the limit.
 *
 * KEYS[1] the hit counter, KEYS[2] the block marker (same hash tag, same slot).
 * ARGV[1] window (ms), ARGV[2] limit, ARGV[3] block duration (ms).
 * Returns { hits, ms until the window ends, blocked (0 or 1), ms until the block ends }.
 *
 * While blocked, requests are not counted. The counter is kept when a block starts, so
 * a client whose block ends before its window does is still over the limit, and its
 * next request blocks it again: waiting out a block never buys back requests inside
 * the window. (`@RateLimit` also refuses a block shorter than its window.)
 */
export const INCREMENT_HITS_SCRIPT = `
local blockTtl = redis.call('PTTL', KEYS[2])
if blockTtl > 0 then
  return { tonumber(ARGV[2]) + 1, blockTtl, 1, blockTtl }
end
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local windowTtl = redis.call('PTTL', KEYS[1])
if windowTtl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  windowTtl = tonumber(ARGV[1])
end
if hits > tonumber(ARGV[2]) then
  local blockMs = tonumber(ARGV[3])
  if blockMs > 0 then
    redis.call('SET', KEYS[2], '1', 'PX', blockMs)
    return { hits, blockMs, 1, blockMs }
  end
  return { hits, windowTtl, 1, windowTtl }
end
return { hits, windowTtl, 0, 0 }
`;

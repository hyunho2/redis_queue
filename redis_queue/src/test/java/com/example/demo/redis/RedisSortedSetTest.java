package com.example.demo.redis;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class RedisSortedSetTest {

    @Autowired
    StringRedisTemplate redisTemplate;

    private final String key = "testSortedSet";

    // Sorted Set
    @Test
    public void 데이터_입력() {

        ZSetOperations<String, String> stringStringZSetOperations = redisTemplate.opsForZSet();

//        stringStringZSetOperations.add(key, "H1", 1);
//        stringStringZSetOperations.add(key, "L2", 1);
//        stringStringZSetOperations.add(key, "E3", System.currentTimeMillis());
//        stringStringZSetOperations.add(key, "L4", System.currentTimeMillis());
//        stringStringZSetOperations.add(key, "O5", System.currentTimeMillis());

        for(int i = 0 ; i < 10000000; i ++) {
            stringStringZSetOperations.add(key, "B"+i, System.currentTimeMillis());
        }
        final Long size = stringStringZSetOperations.size(key);
//
//        System.out.println("size = " + size);
//
//        Set<String> scoreRange = stringStringZSetOperations.range(key,1, 5);
//
//        assert scoreRange != null;
//        System.out.println("scoreRange = " + Arrays.toString(scoreRange.toArray()));
//
//        stringStringZSetOperations.remove(key ,"H1");
//
//        scoreRange = stringStringZSetOperations.range(key,1, 8);
//
//        assert scoreRange != null;
//        System.out.println("scoreRange = " + Arrays.toString(scoreRange.toArray()));
        /*
        redis-cli 명령어
        - ZRANGE key start stop [WITHSCORES]
        - ZRANGEBYSCORE key min max [WITHSCORES]
         */
    }

    @Test
    public void 첫번째_데이터_조회 () {
        ZSetOperations<String, String> stringStringZSetOperations = redisTemplate.opsForZSet();

        System.out.println(stringStringZSetOperations.range(key , 334455 , 334455));
        System.out.println(stringStringZSetOperations.range(key , 334455 , 334455));
    }
    @Test
    public void 데이터_삭제 () {
        ZSetOperations<String, String> stringStringZSetOperations = redisTemplate.opsForZSet();

        System.out.println(stringStringZSetOperations.remove(key , "L2"));
    }
    @Test
    public void 랭크조회 () {
        ZSetOperations<String, String> stringStringZSetOperations = redisTemplate.opsForZSet();

        System.out.println(stringStringZSetOperations.rank(key , "acb14b70-4b69-4c02-81dd-15accf0b3b631645000466946"));
    }
}

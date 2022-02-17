package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Set;
import java.util.UUID;

@RestController
class RedisController {

    private final String key = "testSortedSet";

    @Autowired
    StringRedisTemplate redisTemplate;

    @RequestMapping(value = "/currentUserCount", method = RequestMethod.GET)
    public String currentUserCount(HttpServletRequest request) {
        ZSetOperations<String, String> sortedSet = redisTemplate.opsForZSet();
        return sortedSet.size(key) + "";
    }
    @RequestMapping(value = "/currentRank", method = RequestMethod.GET)
    public String currentRank(HttpServletRequest request) {
        ZSetOperations<String, String> sortedSet = redisTemplate.opsForZSet();
        return sortedSet.rank(key , request.getParameter("resultNo")) + "";
    }

    @RequestMapping(value = "/requestNo", method = RequestMethod.GET)
    public String requestNo(HttpServletRequest request) {
        ZSetOperations<String, String> sortedSet = redisTemplate.opsForZSet();
        return sortedSet.range(key , Integer.parseInt(request.getParameter("requestNo")) , Integer.parseInt(request.getParameter("requestNo"))) + "";
    }

    @RequestMapping(value = "/activeIncrease", method = RequestMethod.GET)
    public String activeIncrease(HttpServletRequest request) {
        ZSetOperations<String, String> sortedSet = redisTemplate.opsForZSet();
        System.out.println("사용자 증가");
        for(int i = 0 ; i < 10000000; i ++) {
            sortedSet.add(key, UUID.randomUUID().toString()+System.currentTimeMillis()+"", System.currentTimeMillis());
        }
        return "";
    }

    @RequestMapping(value = "/process")
    public String process(HttpServletRequest request) {
        ZSetOperations<String, String> stringStringZSetOperations = redisTemplate.opsForZSet();
        int loopCount = Integer.parseInt(request.getParameter("loopCount"));
        int totalCount = Integer.parseInt(request.getParameter("requestNo"))/loopCount + 1;
        for ( int i = 1;i <= totalCount; i++) {
            Set<String> set = stringStringZSetOperations.range(key, 0, loopCount);

            //신규 데이터 저장
            final String key2 = "testList";
            final ListOperations<String, String> stringStringListOperations = redisTemplate.opsForList();

            for (String s : set) {
                //지난간 데이터 삭제
                stringStringZSetOperations.remove(key, s);

                //신규 데이터 저장
                stringStringListOperations.rightPush(key2, s);
            }
        }

        return "";
    }
}

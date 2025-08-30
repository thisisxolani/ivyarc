package com.company.auth.configserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.profiles.active=test",
    "spring.cloud.config.server.git.uri=https://github.com/spring-cloud-samples/config-repo",
    "eureka.client.enabled=false",
    "config.security.enabled=false"
})
class ConfigServerApplicationTest {

    @Test
    void contextLoads() {
    }
}
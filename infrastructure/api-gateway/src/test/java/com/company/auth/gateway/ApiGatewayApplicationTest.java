package com.company.auth.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.profiles.active=test",
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
    "security.jwt.secret=test-secret-key-for-testing-purposes-only-minimum-256-bits"
})
class ApiGatewayApplicationTest {

    @Test
    void contextLoads() {
    }
}
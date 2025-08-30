package com.company.auth.servicediscovery;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.profiles.active=test",
    "eureka.client.register-with-eureka=false",
    "eureka.client.fetch-registry=false",
    "eureka.security.enabled=false"
})
class ServiceDiscoveryApplicationTest {

    @Test
    void contextLoads() {
    }
}
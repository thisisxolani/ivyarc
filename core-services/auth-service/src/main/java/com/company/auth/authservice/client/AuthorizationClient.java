package com.company.auth.authservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "authorization-service", path = "/api/roles")
public interface AuthorizationClient {
    @GetMapping("/current")
    Map<String, Object> getCurrentRoles(@RequestHeader(value = "Authorization", required = false) String bearer);
}


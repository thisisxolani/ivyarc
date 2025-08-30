package com.company.auth.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(ex -> ex
                // Public auth endpoints
                .pathMatchers("/api/v1/auth/**").permitAll()
                // Allow actuator for diagnostics (optional)
                .pathMatchers("/actuator/**").permitAll()
                // Everything else can be adjusted as needed; keep permissive for dev
                .anyExchange().permitAll()
            )
            .build();
    }
}


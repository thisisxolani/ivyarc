package com.company.audit.auditservice.listener;

import com.company.audit.auditservice.dto.AuditEventDto;
import com.company.audit.auditservice.entity.AuditEvent;
import com.company.audit.auditservice.service.AuditEventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AuditEventListener {

    private static final Logger logger = LoggerFactory.getLogger(AuditEventListener.class);

    @Autowired
    private AuditEventService auditEventService;

    @Autowired
    private ObjectMapper objectMapper;

    @RabbitListener(queues = "${app.rabbitmq.audit.queue:audit-events-queue}")
    public void handleAuditEvent(String message) {
        try {
            logger.debug("Received audit event: {}", message);
            
            AuditEventDto auditEventDto = objectMapper.readValue(message, AuditEventDto.class);
            
            // Convert DTO to entity
            AuditEvent auditEvent = convertToEntity(auditEventDto);
            
            // Save to database
            AuditEvent savedEvent = auditEventService.createAuditEvent(auditEvent);
            
            logger.info("Audit event saved with ID: {} for user: {} in service: {}", 
                       savedEvent.getId(), savedEvent.getUserId(), savedEvent.getServiceName());
                       
        } catch (Exception e) {
            logger.error("Error processing audit event: {}", message, e);
            // In production, consider dead letter queue for failed messages
        }
    }

    @RabbitListener(queues = "${app.rabbitmq.auth.queue:auth-events-queue}")
    public void handleAuthEvent(String message) {
        try {
            logger.debug("Received auth event: {}", message);
            
            AuditEventDto auditEventDto = objectMapper.readValue(message, AuditEventDto.class);
            auditEventDto.setServiceName("auth-service");
            
            AuditEvent auditEvent = convertToEntity(auditEventDto);
            AuditEvent savedEvent = auditEventService.createAuditEvent(auditEvent);
            
            logger.info("Auth audit event saved with ID: {} for user: {}", 
                       savedEvent.getId(), savedEvent.getUserId());
                       
        } catch (Exception e) {
            logger.error("Error processing auth event: {}", message, e);
        }
    }

    @RabbitListener(queues = "${app.rabbitmq.user.queue:user-events-queue}")
    public void handleUserManagementEvent(String message) {
        try {
            logger.debug("Received user management event: {}", message);
            
            AuditEventDto auditEventDto = objectMapper.readValue(message, AuditEventDto.class);
            auditEventDto.setServiceName("user-management-service");
            
            AuditEvent auditEvent = convertToEntity(auditEventDto);
            AuditEvent savedEvent = auditEventService.createAuditEvent(auditEvent);
            
            logger.info("User management audit event saved with ID: {} for user: {}", 
                       savedEvent.getId(), savedEvent.getUserId());
                       
        } catch (Exception e) {
            logger.error("Error processing user management event: {}", message, e);
        }
    }

    @RabbitListener(queues = "${app.rabbitmq.security.queue:security-events-queue}")
    public void handleSecurityEvent(String message) {
        try {
            logger.debug("Received security event: {}", message);
            
            AuditEventDto auditEventDto = objectMapper.readValue(message, AuditEventDto.class);
            
            // Security events get special handling
            AuditEvent auditEvent = convertToEntity(auditEventDto);
            AuditEvent savedEvent = auditEventService.createAuditEvent(auditEvent);
            
            // Log security events at higher priority
            logger.warn("SECURITY EVENT: {} saved with ID: {} for user: {} from IP: {}", 
                       savedEvent.getEventType(), savedEvent.getId(), 
                       savedEvent.getUserId(), savedEvent.getIpAddress());
                       
        } catch (Exception e) {
            logger.error("Error processing security event: {}", message, e);
        }
    }

    private AuditEvent convertToEntity(AuditEventDto dto) {
        AuditEvent event = new AuditEvent();
        event.setEventType(dto.getEventType());
        event.setServiceName(dto.getServiceName());
        event.setUserId(dto.getUserId());
        event.setSessionId(dto.getSessionId());
        event.setIpAddress(dto.getIpAddress());
        event.setUserAgent(dto.getUserAgent());
        event.setResource(dto.getResource());
        event.setAction(dto.getAction());
        event.setStatus(dto.getStatus());
        event.setDetails(dto.getDetails());
        event.setRequestId(dto.getRequestId());
        event.setCorrelationId(dto.getCorrelationId());
        event.setDurationMs(dto.getDurationMs());
        
        // Timestamp will be set by the service if null
        if (dto.getTimestamp() != null) {
            event.setTimestamp(dto.getTimestamp());
        }
        
        return event;
    }
}
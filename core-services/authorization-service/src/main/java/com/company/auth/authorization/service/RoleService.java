package com.company.auth.authorization.service;

import com.company.auth.authorization.dto.RoleDto;
import com.company.auth.authorization.entity.Permission;
import com.company.auth.authorization.entity.Role;
import com.company.auth.authorization.repository.PermissionRepository;
import com.company.auth.authorization.repository.RoleRepository;
import com.company.auth.authorization.repository.UserRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing roles
 */
@Service
@Transactional
public class RoleService {

    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository, 
                      PermissionRepository permissionRepository,
                      UserRoleRepository userRoleRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRoleRepository = userRoleRepository;
    }

    /**
     * Get all roles
     */
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        logger.debug("Getting all roles");
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all roles with pagination
     */
    @Transactional(readOnly = true)
    public Page<RoleDto> getAllRoles(Pageable pageable) {
        logger.debug("Getting all roles with pagination");
        Page<Role> roles = roleRepository.findAll(pageable);
        List<RoleDto> roleDtos = roles.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(roleDtos, pageable, roles.getTotalElements());
    }

    /**
     * Get active roles
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "roles", key = "'active'")
    public List<RoleDto> getActiveRoles() {
        logger.debug("Getting active roles");
        List<Role> roles = roleRepository.findByIsActiveTrue();
        return roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get role by ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "roles", key = "#id")
    public Optional<RoleDto> getRoleById(Long id) {
        logger.debug("Getting role by ID: {}", id);
        return roleRepository.findById(id)
                .map(this::convertToDto);
    }

    /**
     * Get role by name
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "roles", key = "#name")
    public Optional<RoleDto> getRoleByName(String name) {
        logger.debug("Getting role by name: {}", name);
        return roleRepository.findByName(name)
                .map(this::convertToDto);
    }

    /**
     * Create new role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public RoleDto createRole(RoleDto roleDto) {
        logger.info("Creating new role: {}", roleDto.getName());

        if (roleRepository.existsByName(roleDto.getName())) {
            throw new IllegalArgumentException("Role with name '" + roleDto.getName() + "' already exists");
        }

        Role role = convertToEntity(roleDto);
        role = roleRepository.save(role);

        logger.info("Created role with ID: {}", role.getId());
        return convertToDto(role);
    }

    /**
     * Update existing role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public RoleDto updateRole(Long id, RoleDto roleDto) {
        logger.info("Updating role with ID: {}", id);

        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));

        if (existingRole.getIsSystem()) {
            throw new IllegalStateException("Cannot update system role: " + existingRole.getName());
        }

        // Check for name conflicts
        if (!existingRole.getName().equals(roleDto.getName()) && 
            roleRepository.existsByName(roleDto.getName())) {
            throw new IllegalArgumentException("Role with name '" + roleDto.getName() + "' already exists");
        }

        existingRole.setName(roleDto.getName());
        existingRole.setDescription(roleDto.getDescription());
        
        if (roleDto.getIsActive() != null) {
            existingRole.setIsActive(roleDto.getIsActive());
        }

        existingRole = roleRepository.save(existingRole);

        logger.info("Updated role: {}", existingRole.getName());
        return convertToDto(existingRole);
    }

    /**
     * Delete role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public void deleteRole(Long id) {
        logger.info("Deleting role with ID: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));

        if (role.getIsSystem()) {
            throw new IllegalStateException("Cannot delete system role: " + role.getName());
        }

        // Check if role is assigned to any users
        long userCount = userRoleRepository.countByRoleIdAndIsActiveTrue(id);
        if (userCount > 0) {
            throw new IllegalStateException("Cannot delete role that is assigned to " + userCount + " users");
        }

        roleRepository.delete(role);
        logger.info("Deleted role: {}", role.getName());
    }

    /**
     * Assign permission to role
     */
    @CacheEvict(value = {"roles", "permissions"}, allEntries = true)
    public void assignPermissionToRole(Long roleId, Long permissionId) {
        logger.info("Assigning permission {} to role {}", permissionId, roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + roleId));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with ID: " + permissionId));

        role.addPermission(permission);
        roleRepository.save(role);

        logger.info("Assigned permission '{}' to role '{}'", permission.getName(), role.getName());
    }

    /**
     * Remove permission from role
     */
    @CacheEvict(value = {"roles", "permissions"}, allEntries = true)
    public void removePermissionFromRole(Long roleId, Long permissionId) {
        logger.info("Removing permission {} from role {}", permissionId, roleId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + roleId));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with ID: " + permissionId));

        role.removePermission(permission);
        roleRepository.save(role);

        logger.info("Removed permission '{}' from role '{}'", permission.getName(), role.getName());
    }

    /**
     * Get roles by user ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "user-roles", key = "#userId")
    public List<RoleDto> getRolesByUserId(Long userId) {
        logger.debug("Getting roles for user: {}", userId);
        List<Role> roles = roleRepository.findActiveRolesByUserId(userId);
        return roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Search roles
     */
    @Transactional(readOnly = true)
    public Page<RoleDto> searchRoles(String searchTerm, Pageable pageable) {
        logger.debug("Searching roles with term: {}", searchTerm);
        Page<Role> roles = roleRepository.searchRoles(searchTerm, pageable);
        List<RoleDto> roleDtos = roles.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(roleDtos, pageable, roles.getTotalElements());
    }

    /**
     * Get role statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getRoleStatistics() {
        logger.debug("Getting role statistics");
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", roleRepository.count());
        stats.put("active", roleRepository.countByIsActive(true));
        stats.put("inactive", roleRepository.countByIsActive(false));
        stats.put("system", roleRepository.countByIsSystemTrue());
        return stats;
    }

    /**
     * Convert Role entity to DTO
     */
    private RoleDto convertToDto(Role role) {
        RoleDto dto = new RoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setIsActive(role.getIsActive());
        dto.setIsSystem(role.getIsSystem());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());

        // Include permissions if available
        if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
            Set<String> permissions = role.getPermissions().stream()
                    .filter(Permission::getIsActive)
                    .map(Permission::getName)
                    .collect(Collectors.toSet());
            dto.setPermissions(permissions);
        }

        // Include user count
        long userCount = userRoleRepository.countByRoleIdAndIsActiveTrue(role.getId());
        dto.setUserCount(userCount);

        return dto;
    }

    /**
     * Convert DTO to Role entity
     */
    private Role convertToEntity(RoleDto dto) {
        Role role = new Role();
        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        
        if (dto.getIsActive() != null) {
            role.setIsActive(dto.getIsActive());
        }
        
        if (dto.getIsSystem() != null) {
            role.setIsSystem(dto.getIsSystem());
        }

        return role;
    }
}
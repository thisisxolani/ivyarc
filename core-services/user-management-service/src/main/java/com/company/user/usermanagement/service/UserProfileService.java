package com.company.user.usermanagement.service;

import com.company.user.usermanagement.dto.UserProfileDto;
import com.company.user.usermanagement.entity.UserProfile;
import com.company.user.usermanagement.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserProfileService {

    @Autowired
    private UserProfileRepository userProfileRepository;

    public UserProfileDto createUserProfile(UserProfileDto userProfileDto) {
        if (userProfileRepository.existsByUserId(userProfileDto.getUserId())) {
            throw new RuntimeException("User with ID " + userProfileDto.getUserId() + " already exists");
        }
        
        if (userProfileRepository.existsByEmail(userProfileDto.getEmail())) {
            throw new RuntimeException("User with email " + userProfileDto.getEmail() + " already exists");
        }

        UserProfile userProfile = convertToEntity(userProfileDto);
        userProfile.setIsActive(true);
        UserProfile savedProfile = userProfileRepository.save(userProfile);
        return convertToDto(savedProfile);
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDto> getUserProfileById(Long id) {
        return userProfileRepository.findById(id)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDto> getUserProfileByUserId(String userId) {
        return userProfileRepository.findByUserId(userId)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDto> getUserProfileByEmail(String email) {
        return userProfileRepository.findByEmail(email)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<UserProfileDto> getAllUserProfiles(Pageable pageable) {
        return userProfileRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<UserProfileDto> getActiveUserProfiles(Pageable pageable) {
        return userProfileRepository.findByIsActiveTrue(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<UserProfileDto> searchUserProfiles(String searchTerm, Pageable pageable) {
        return userProfileRepository.findBySearchTerm(searchTerm, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<UserProfileDto> searchActiveUserProfiles(String searchTerm, Pageable pageable) {
        return userProfileRepository.findByIsActiveAndSearchTerm(true, searchTerm, pageable)
                .map(this::convertToDto);
    }

    public UserProfileDto updateUserProfile(Long id, UserProfileDto userProfileDto) {
        UserProfile existingProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User profile not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (!existingProfile.getEmail().equals(userProfileDto.getEmail()) && 
            userProfileRepository.existsByEmail(userProfileDto.getEmail())) {
            throw new RuntimeException("User with email " + userProfileDto.getEmail() + " already exists");
        }

        updateEntityFromDto(existingProfile, userProfileDto);
        UserProfile updatedProfile = userProfileRepository.save(existingProfile);
        return convertToDto(updatedProfile);
    }

    public UserProfileDto updateUserProfileByUserId(String userId, UserProfileDto userProfileDto) {
        UserProfile existingProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found with userId: " + userId));

        // Check if email is being changed and if new email already exists
        if (!existingProfile.getEmail().equals(userProfileDto.getEmail()) && 
            userProfileRepository.existsByEmail(userProfileDto.getEmail())) {
            throw new RuntimeException("User with email " + userProfileDto.getEmail() + " already exists");
        }

        updateEntityFromDto(existingProfile, userProfileDto);
        UserProfile updatedProfile = userProfileRepository.save(existingProfile);
        return convertToDto(updatedProfile);
    }

    public void deleteUserProfile(Long id) {
        if (!userProfileRepository.existsById(id)) {
            throw new RuntimeException("User profile not found with id: " + id);
        }
        userProfileRepository.deleteById(id);
    }

    public void deactivateUserProfile(Long id) {
        UserProfile userProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User profile not found with id: " + id));
        userProfile.setIsActive(false);
        userProfileRepository.save(userProfile);
    }

    public void activateUserProfile(Long id) {
        UserProfile userProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User profile not found with id: " + id));
        userProfile.setIsActive(true);
        userProfileRepository.save(userProfile);
    }

    @Transactional(readOnly = true)
    public long getActiveUserCount() {
        return userProfileRepository.countActiveUsers();
    }

    @Transactional(readOnly = true)
    public long getInactiveUserCount() {
        return userProfileRepository.countInactiveUsers();
    }

    // Conversion methods
    private UserProfileDto convertToDto(UserProfile userProfile) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(userProfile.getId());
        dto.setUserId(userProfile.getUserId());
        dto.setFirstName(userProfile.getFirstName());
        dto.setLastName(userProfile.getLastName());
        dto.setEmail(userProfile.getEmail());
        dto.setPhone(userProfile.getPhone());
        dto.setAvatarUrl(userProfile.getAvatarUrl());
        dto.setBio(userProfile.getBio());
        dto.setIsActive(userProfile.getIsActive());
        dto.setFullName(userProfile.getFullName());
        dto.setCreatedAt(userProfile.getCreatedAt());
        dto.setUpdatedAt(userProfile.getUpdatedAt());
        return dto;
    }

    private UserProfile convertToEntity(UserProfileDto dto) {
        UserProfile userProfile = new UserProfile();
        userProfile.setUserId(dto.getUserId());
        userProfile.setFirstName(dto.getFirstName());
        userProfile.setLastName(dto.getLastName());
        userProfile.setEmail(dto.getEmail());
        userProfile.setPhone(dto.getPhone());
        userProfile.setAvatarUrl(dto.getAvatarUrl());
        userProfile.setBio(dto.getBio());
        if (dto.getIsActive() != null) {
            userProfile.setIsActive(dto.getIsActive());
        }
        return userProfile;
    }

    private void updateEntityFromDto(UserProfile userProfile, UserProfileDto dto) {
        userProfile.setFirstName(dto.getFirstName());
        userProfile.setLastName(dto.getLastName());
        userProfile.setEmail(dto.getEmail());
        userProfile.setPhone(dto.getPhone());
        userProfile.setAvatarUrl(dto.getAvatarUrl());
        userProfile.setBio(dto.getBio());
        if (dto.getIsActive() != null) {
            userProfile.setIsActive(dto.getIsActive());
        }
    }
}
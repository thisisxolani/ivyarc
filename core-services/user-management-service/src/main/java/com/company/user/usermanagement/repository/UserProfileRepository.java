package com.company.user.usermanagement.repository;

import com.company.user.usermanagement.entity.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUserId(String userId);

    Optional<UserProfile> findByEmail(String email);

    boolean existsByUserId(String userId);

    boolean existsByEmail(String email);

    List<UserProfile> findByIsActiveTrue();

    Page<UserProfile> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT u FROM UserProfile u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<UserProfile> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT u FROM UserProfile u WHERE " +
           "u.isActive = :isActive AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<UserProfile> findByIsActiveAndSearchTerm(
            @Param("isActive") Boolean isActive,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT COUNT(u) FROM UserProfile u WHERE u.isActive = true")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM UserProfile u WHERE u.isActive = false")
    long countInactiveUsers();
}
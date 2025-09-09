package com.company.auth.authorization.repository;

import com.company.auth.authorization.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    @Query("select ur from UserRole ur join fetch ur.role r where ur.username = :username")
    List<UserRole> findByUsernameWithRole(@Param("username") String username);
}


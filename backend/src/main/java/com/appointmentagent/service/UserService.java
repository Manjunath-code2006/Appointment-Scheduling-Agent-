package com.appointmentagent.service;

import com.appointmentagent.dto.request.ChangePasswordRequest;
import com.appointmentagent.dto.request.UpdateUserRequest;
import com.appointmentagent.dto.response.UserResponse;
import com.appointmentagent.entity.Role;
import com.appointmentagent.entity.User;
import com.appointmentagent.exception.BadRequestException;
import com.appointmentagent.exception.ResourceNotFoundException;
import com.appointmentagent.repository.RoleRepository;
import com.appointmentagent.repository.UserRepository;
import com.appointmentagent.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::toResponse);
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.searchUsers(query).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return toResponse(findUserById(id));
    }

    public UserResponse getCurrentUser() {
        UserDetailsImpl principal = getCurrentPrincipal();
        return getUserById(principal.getId());
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserById(id);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setProfileImageUrl(request.getProfileImageUrl());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateCurrentUser(UpdateUserRequest request) {
        UserDetailsImpl principal = getCurrentPrincipal();
        return updateUser(principal.getId(), request);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserDetailsImpl principal = getCurrentPrincipal();
        User user = findUserById(principal.getId());

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findUserById(id);
        user.setDeleted(true);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse assignRole(Long userId, String roleName) {
        User user = findUserById(userId);
        Role role = roleRepository.findByName(Role.RoleName.valueOf(roleName))
                .orElseThrow(() -> new BadRequestException("Invalid role: " + roleName));
        user.getRoles().add(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = findUserById(id);
        user.setEnabled(!user.isEnabled());
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getUsersByRole(Role.RoleName roleName) {
        return userRepository.findAllByRoleName(roleName).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---- helpers ----

    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private UserDetailsImpl getCurrentPrincipal() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    public UserResponse toResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .profileImageUrl(user.getProfileImageUrl())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

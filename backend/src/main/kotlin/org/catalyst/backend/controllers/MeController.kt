package org.catalyst.backend.controllers

import jakarta.validation.Valid
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.ChangePasswordRequest
import org.catalyst.backend.responses.AuthenticationResponse
import org.catalyst.backend.responses.ConfigResponse
import org.catalyst.backend.responses.SubscriptionResponse
import org.catalyst.backend.responses.UserResponse
import org.catalyst.backend.services.AuthenticationService
import org.catalyst.backend.services.UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/me")
class MeController(private val userService: UserService, private val authenticationService: AuthenticationService) {
    @GetMapping
    fun getUser(@AuthenticationPrincipal user: User): UserResponse {
        return user.toResponse()
    }

    @GetMapping("/subscriptions")
    fun getSubscriptions(@AuthenticationPrincipal user: User): List<SubscriptionResponse> {
        return user.subscriptions.map { it.toResponse() }
    }

    @GetMapping("/configs")
    fun getConfigs(@AuthenticationPrincipal user: User): List<ConfigResponse> {
        return user.configs.map { it.toResponse() }
    }

    @PostMapping("/change-password")
    fun changePassword(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: ChangePasswordRequest
    ): AuthenticationResponse {
        return authenticationService.changePassword(user, request.oldPassword, request.newPassword)
    }
}
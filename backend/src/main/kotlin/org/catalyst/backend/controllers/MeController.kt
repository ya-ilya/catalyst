package org.catalyst.backend.controllers

import jakarta.validation.Valid
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.ChangePasswordRequest
import org.catalyst.backend.responses.*
import org.catalyst.backend.services.AuthenticationService
import org.catalyst.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

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

    @GetMapping("/cape")
    fun getCape(@AuthenticationPrincipal user: User): CapeResponse {
        return user.cape?.toResponse() ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "You didn't select cape")
    }

    @PostMapping("/change-password")
    fun changePassword(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: ChangePasswordRequest
    ): AuthenticationResponse {
        return authenticationService.changePassword(user, request.oldPassword, request.newPassword)
    }
}
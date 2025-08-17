package org.catalyst.backend.controllers

import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.ChangePasswordRequest
import org.catalyst.backend.responses.ConfigResponse
import org.catalyst.backend.responses.UserResponse
import org.catalyst.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/me")
class MeController(private val userService: UserService) {
    @GetMapping
    fun getUser(@AuthenticationPrincipal user: User): UserResponse {
        return user.toResponse()
    }

    @GetMapping("/subscriptions")
    fun getSubscriptions(@AuthenticationPrincipal user: User): List<ConfigResponse> {
        return user.subscriptions.map { it.config.toResponse() }
    }

    @GetMapping("/configs")
    fun getConfigs(@AuthenticationPrincipal user: User): List<ConfigResponse> {
        return user.configs.map { it.toResponse() }
    }

    @PostMapping("/change-password")
    fun changePassword(
        @AuthenticationPrincipal user: User,
        @RequestBody request: ChangePasswordRequest
    ) {
        if (!userService.checkPassword(user, request.oldPassword)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid old password")
        }

        userService.changePassword(user, request.newPassword)
    }
}
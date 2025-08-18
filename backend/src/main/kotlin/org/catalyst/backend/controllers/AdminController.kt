package org.catalyst.backend.controllers

import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.CreateUserRequest
import org.catalyst.backend.responses.UserCreatedResponse
import org.catalyst.backend.responses.UserResponse
import org.catalyst.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.security.SecureRandom
import java.util.*
import kotlin.streams.asSequence

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(private val userService: UserService) {
    private companion object {
        const val CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-="

        fun generateRandomPassword(length: Int = 32): String {
            val secureRandom = SecureRandom()

            return secureRandom
                .ints(length.toLong(), 0, CHARACTERS.length)
                .asSequence()
                .map { CHARACTERS[it] }
                .joinToString("")
        }
    }

    @GetMapping("/users")
    fun getUsers(): List<UserResponse> {
        return userService.getUsers().map { it.toResponse() }
    }

    @GetMapping("/users/{id}")
    fun getUserById(@PathVariable id: UUID): UserResponse {
        return userService.getUserById(id).toResponse()
    }

    @PostMapping("/users")
    fun createUser(@RequestBody request: CreateUserRequest): UserCreatedResponse {
        val temporaryPassword = generateRandomPassword()
        val user = userService.createUser(
            request.username,
            temporaryPassword
        )

        return UserCreatedResponse(
            user.id!!,
            user.username,
            temporaryPassword,
            user.createdAt
        )
    }

    @DeleteMapping("/users/{id}")
    fun deleteUser(@AuthenticationPrincipal user: User, @PathVariable id: UUID) {
        if (user.id == id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete yourself")
        }

        userService.deleteUserById(id)
    }
}
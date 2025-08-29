package org.catalyst.backend.controllers

import jakarta.validation.Valid
import jakarta.validation.constraints.Size
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.CreateUserRequest
import org.catalyst.backend.responses.CapeResponse
import org.catalyst.backend.responses.UserCreatedResponse
import org.catalyst.backend.responses.UserResponse
import org.catalyst.backend.services.CapeService
import org.catalyst.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.security.SecureRandom
import java.util.*
import kotlin.streams.asSequence

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    private val userService: UserService,
    private val capeService: CapeService
) {
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
    fun getUsers(
        @RequestParam(value = "limit", required = false, defaultValue = "10") limit: Int,
        @RequestParam(value = "offset", required = false, defaultValue = "0") offset: Int,
    ): ResponseEntity<List<UserResponse>> {
        val page = userService.getUsers(limit, offset)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/users/{id}")
    fun getUserById(@PathVariable id: UUID): UserResponse {
        return userService.getUserById(id).toResponse()
    }

    @PostMapping("/users")
    fun createUser(@Valid @RequestBody request: CreateUserRequest): UserCreatedResponse {
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
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete self")
        }

        userService.deleteUserById(id)
    }

    @PostMapping("/capes", consumes = ["multipart/form-data"])
    fun createCape(
        @RequestParam("name") @Size(min = 4, max = 32) name: String,
        @RequestParam("description") @Size(min = 4, max = 256) description: String,
        @RequestParam("image") image: MultipartFile
    ): CapeResponse {
        return capeService.createCape(
            name,
            description,
            image
        ).toResponse()
    }

    @DeleteMapping("/capes/{id}")
    fun deleteCape(@PathVariable id: UUID) {
        capeService.deleteCapeById(id)
    }
}
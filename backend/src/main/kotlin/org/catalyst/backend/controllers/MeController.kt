package org.catalyst.backend.controllers

import jakarta.validation.Valid
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.ChangePasswordRequest
import org.catalyst.backend.responses.*
import org.catalyst.backend.services.AuthenticationService
import org.catalyst.backend.services.CapeService
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.io.IOException

@RestController
@RequestMapping("/api/me")
class MeController(
    private val capeService: CapeService,
    private val authenticationService: AuthenticationService
) {
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

    @GetMapping("/cape/image", produces = ["image/png"])
    fun getCapeImage(@AuthenticationPrincipal user: User): ResponseEntity<ByteArrayResource> {
        if (user.cape == null) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "You didn't select cape")
        }

        val image = try {
            capeService.loadCapeImage(user.cape!!.id!!)
        } catch (_: IOException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Cape image not found")
        }

        val resource = ByteArrayResource(image)

        return ResponseEntity
            .status(HttpStatus.OK)
            .contentType(MediaType.IMAGE_PNG)
            .contentLength(image.size.toLong())
            .body(resource)
    }

    @PostMapping("/change-password")
    fun changePassword(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: ChangePasswordRequest
    ): AuthenticationResponse {
        return authenticationService.changePassword(user, request.oldPassword, request.newPassword)
    }
}
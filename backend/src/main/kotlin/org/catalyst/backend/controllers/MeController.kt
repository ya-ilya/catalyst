package org.catalyst.backend.controllers

import jakarta.validation.Valid
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.ChangePasswordRequest
import org.catalyst.backend.responses.AuthenticationResponse
import org.catalyst.backend.responses.ConfigResponse
import org.catalyst.backend.responses.SubscriptionResponse
import org.catalyst.backend.responses.UserResponse
import org.catalyst.backend.services.AuthenticationService
import org.catalyst.backend.services.CapeService
import org.catalyst.backend.services.SubscriptionService
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
    private val subscriptionService: SubscriptionService,
    private val authenticationService: AuthenticationService
) {
    @GetMapping
    fun getUser(@AuthenticationPrincipal user: User): UserResponse {
        return user.toResponse()
    }

    @GetMapping("/subscriptions")
    fun getSubscriptions(
        @AuthenticationPrincipal user: User,
        @RequestParam(value = "limit", required = false, defaultValue = "30") limit: Int,
        @RequestParam(value = "offset", required = false, defaultValue = "0") offset: Int,
    ): ResponseEntity<List<SubscriptionResponse>> {
        val page = subscriptionService.findByUser(user, limit, offset)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/configs")
    fun getConfigs(@AuthenticationPrincipal user: User): List<ConfigResponse> {
        return user.configs.map { it.toResponse() }
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

    @GetMapping("/cape/unselect")
    fun unselectCape(@AuthenticationPrincipal user: User) {
        if (user.cape == null) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "You didn't select cape")
        }

        capeService.unselect(user)
    }

    @PostMapping("/change-password")
    fun changePassword(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: ChangePasswordRequest
    ): AuthenticationResponse {
        return authenticationService.changePassword(user, request.oldPassword, request.newPassword)
    }
}
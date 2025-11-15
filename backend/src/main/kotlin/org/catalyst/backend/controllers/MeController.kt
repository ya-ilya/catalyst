package org.catalyst.backend.controllers

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.catalyst.backend.configurations.annotations.CommonApiResponses
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.services.AuthenticationService
import org.catalyst.backend.services.CapeService
import org.catalyst.backend.services.SubscriptionService
import org.catalyst.common.requests.ChangePasswordRequest
import org.catalyst.common.responses.AuthenticationResponse
import org.catalyst.common.responses.ErrorResponse
import org.catalyst.common.responses.SubscriptionResponse
import org.catalyst.common.responses.UserResponse
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.io.IOException
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody

@RestController
@RequestMapping("/api/me")
@Tag(name = "Me", description = "Endpoints for managing the current authenticated user's data")
class MeController(
    private val capeService: CapeService,
    private val subscriptionService: SubscriptionService,
    private val authenticationService: AuthenticationService
) {
    @GetMapping
    @Operation(summary = "Get current authenticated user details")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(implementation = UserResponse::class))]
    )
    @CommonApiResponses
    fun getUser(@AuthenticationPrincipal user: User): UserResponse {
        return user.toResponse()
    }

    @GetMapping("/subscriptions")
    @Operation(summary = "Get a list of configs the current user is subscribed to, with pagination, filtering and sorting")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(array = ArraySchema(schema = Schema(implementation = SubscriptionResponse::class)))]
    )
    @CommonApiResponses
    fun getSubscriptions(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "Number of subscriptions to return per page")
        @RequestParam(value = "limit", required = false, defaultValue = "30")
        limit: Int,
        @Parameter(description = "Offset for pagination")
        @RequestParam(value = "offset", required = false, defaultValue = "0")
        offset: Int,
        @Parameter(description = "Filter subscriptions by config name")
        @RequestParam(value = "query", required = false)
        query: String?,
        @Parameter(description = "Filter subscriptions by config author username")
        @RequestParam(value = "author", required = false)
        author: String?,
        @Parameter(description = "Filter subscriptions by config tags")
        @RequestParam(value = "tags", required = false)
        tags: List<String>?,
        @Parameter(description = "Field to sort by (e.g., subscribedAt, config.name, config.author.username)")
        @RequestParam(value = "sortBy", required = false, defaultValue = "subscribedAt")
        sortBy: String?
    ): ResponseEntity<List<SubscriptionResponse>> {
        val page = subscriptionService.findByUser(user, limit, offset, query, author, tags, sortBy)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/cape/image", produces = ["image/png"])
    @Operation(summary = "Get the image of the cape selected by the current user")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(type = "string", format = "binary"))]
    )
    @CommonApiResponses
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
    @Operation(summary = "Unselect the current user's cape")
    @ApiResponse(
        responseCode = "204",
        description = "No content (unselected)",
        content = [Content(schema = Schema(implementation = ErrorResponse::class))]
    )
    @CommonApiResponses
    fun unselectCape(@AuthenticationPrincipal user: User) {
        if (user.cape == null) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "You didn't select cape")
        }

        capeService.unselect(user)
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change the current user's password")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(implementation = AuthenticationResponse::class))]
    )
    @CommonApiResponses
    fun changePassword(
        @AuthenticationPrincipal
        user: User,
        @Valid
        @RequestBody
        @SwaggerRequestBody(description = "Password change request payload", required = true)
        request: ChangePasswordRequest
    ): AuthenticationResponse {
        return authenticationService.changePassword(user, request.oldPassword, request.newPassword)
    }
}
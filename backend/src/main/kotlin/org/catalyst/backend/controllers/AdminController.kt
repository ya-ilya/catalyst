package org.catalyst.backend.controllers

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.validation.constraints.Size
import org.catalyst.backend.configurations.annotations.CommonApiResponses
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.services.CapeService
import org.catalyst.backend.services.UserService
import org.catalyst.common.requests.CreateUserRequest
import org.catalyst.common.responses.CapeResponse
import org.catalyst.common.responses.UserCreatedResponse
import org.catalyst.common.responses.UserResponse
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
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Endpoints for administrator actions")
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
    @Operation(
        summary = "Get a list of all users with pagination, filtering and sorting",
        description = "Requires ADMIN role"
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(array = ArraySchema(schema = Schema(implementation = UserResponse::class)))]
    )
    @CommonApiResponses
    fun getUsers(
        @Parameter(description = "Number of users to return per page")
        @RequestParam(value = "limit", required = false, defaultValue = "10")
        limit: Int,
        @Parameter(description = "Offset for pagination")
        @RequestParam(value = "offset", required = false, defaultValue = "0")
        offset: Int,
        @Parameter(description = "Filter users by ID or username")
        @RequestParam(
            value = "filter",
            required = false
        )
        filter: String?,
        @Parameter(description = "Field to sort by (e.g., createdAt, username)")
        @RequestParam(value = "sortBy", required = false, defaultValue = "createdAt")
        sortBy: String?
    ): ResponseEntity<List<UserResponse>> {
        val page = userService.getUsers(limit, offset, filter, sortBy)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get a user by their ID", description = "Requires ADMIN role")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(implementation = UserResponse::class))]
    )
    @CommonApiResponses
    fun getUserById(
        @Parameter(description = "ID of the user to retrieve")
        @PathVariable
        id: UUID
    ): UserResponse {
        return userService.getUserById(id).toResponse()
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user with a temporary password", description = "Requires ADMIN role")
    @ApiResponse(
        responseCode = "201",
        description = "User created",
        content = [Content(schema = Schema(implementation = UserCreatedResponse::class))]
    )
    @CommonApiResponses
    @ResponseStatus(HttpStatus.CREATED)
    fun createUser(
        @Valid
        @RequestBody
        @SwaggerRequestBody(description = "User creation request", required = true)
        request: CreateUserRequest
    ): UserCreatedResponse {
        val temporaryPassword = generateRandomPassword()
        val user = userService.createUser(
            request.username!!,
            temporaryPassword,
            request.minecraftUuid!!
        )

        return UserCreatedResponse(
            user.id!!,
            user.username,
            temporaryPassword,
            user.createdAt
        )
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a user by their ID", description = "Requires ADMIN role")
    @ApiResponse(responseCode = "204", description = "No content (user deleted)")
    @CommonApiResponses
    fun deleteUser(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the user to delete")
        @PathVariable
        id: UUID
    ) {
        if (user.id == id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete self")
        }

        userService.deleteUserById(id)
    }

    @PostMapping("/capes", consumes = ["multipart/form-data"])
    @Operation(summary = "Create a new cape", description = "Requires ADMIN role")
    @ApiResponse(responseCode = "201", description = "Cape created")
    @CommonApiResponses
    @ResponseStatus(HttpStatus.CREATED)
    fun createCape(
        @Parameter(description = "Name of the cape (4-32 characters)")
        @RequestParam("name")
        @Size(min = 4, max = 32)
        name: String,
        @Parameter(description = "Description of the cape (4-256 characters)")
        @RequestParam("description")
        @Size(min = 4, max = 256)
        description: String,
        @Parameter(description = "Image file for the cape (PNG)")
        @RequestParam("image")
        image: MultipartFile
    ): CapeResponse {
        return capeService.createCape(
            name,
            description,
            image
        ).toResponse()
    }

    @DeleteMapping("/capes/{id}")
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a cape by its ID", description = "Requires ADMIN role")
    @ApiResponse(responseCode = "204", description = "No content (cape deleted)")
    @CommonApiResponses
    fun deleteCape(
        @Parameter(description = "ID of the cape to delete")
        @PathVariable
        id: UUID
    ) {
        capeService.deleteCapeById(id)
    }
}
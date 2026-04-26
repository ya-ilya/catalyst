package org.catalyst.backend.controllers

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.catalyst.backend.configurations.annotations.CommonApiResponses
import org.catalyst.backend.services.UserService
import org.catalyst.common.responses.UserProfileResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for user public data")
class UserController(
    private val userService: UserService
) {
    @GetMapping("/{minecraftUuid}/profile")
    @Operation(
        summary = "Get user profile with active cape by Minecraft UUID",
        description = "Publicly accessible for Minecraft clients to fetch capes"
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK"
    )
    @CommonApiResponses
    fun getUserProfile(
        @Parameter(description = "Minecraft UUID of the player")
        @PathVariable
        minecraftUuid: UUID
    ): UserProfileResponse {
        val user = userService.getUserByMinecraftUuid(minecraftUuid)

        return UserProfileResponse(
            id = user.id!!,
            username = user.username,
            minecraftUuid = user.minecraftUuid!!,
            capeId = user.cape?.id
        )
    }
}
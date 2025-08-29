package org.catalyst.backend.controllers

import jakarta.validation.Valid
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.CreateConfigRequest
import org.catalyst.backend.requests.UpdateConfigRequest
import org.catalyst.backend.responses.ConfigFileResponse
import org.catalyst.backend.responses.ConfigResponse
import org.catalyst.backend.responses.SubscriptionResponse
import org.catalyst.backend.services.ConfigService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/configs")
class ConfigController(private val configService: ConfigService) {
    @GetMapping
    fun getPublicConfigs(
        @RequestParam(value = "limit", required = false, defaultValue = "30") limit: Int,
        @RequestParam(value = "offset", required = false, defaultValue = "0") offset: Int,
    ): ResponseEntity<List<ConfigResponse>> {
        val page = configService.getPublicConfigs(limit, offset)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/{id}")
    fun getConfigById(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ): ConfigResponse {
        return configService
            .getConfigForUser(id, user)
            .toResponse()
    }

    @GetMapping("/{id}/files")
    fun getConfigFiles(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ): List<ConfigFileResponse> {
        return configService
            .getConfigForUser(id, user)
            .files
            .map { it.toResponse() }
    }

    @GetMapping("/{id}/files/{name}")
    fun getConfigFile(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID,
        @PathVariable name: String
    ): String {
        return configService
            .getConfigForUser(id, user)
            .files
            .first { it.name == name }
            .data
    }

    @GetMapping("/{id}/subscribe")
    fun subscribe(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ): SubscriptionResponse {
        return configService.subscribe(id, user).toResponse()
    }

    @GetMapping("/{id}/unsubscribe")
    fun unsubscribe(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ) {
        configService.unsubscribe(id, user)
    }

    @PostMapping
    fun createConfig(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreateConfigRequest
    ): ConfigResponse {
        return configService
            .createConfig(request.name, request.files, request.isPublic, user)
            .toResponse()
    }

    @PatchMapping("/{id}")
    fun updateConfig(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateConfigRequest
    ): ConfigResponse {
        return configService
            .updateConfig(id, request.name, request.files, user)
            .toResponse()
    }

    @DeleteMapping("/{id}")
    fun deleteConfig(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ) {
        return configService.deleteConfigForUser(id, user)
    }
}
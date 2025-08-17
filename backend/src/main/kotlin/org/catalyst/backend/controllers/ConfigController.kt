package org.catalyst.backend.controllers

import org.catalyst.backend.entities.user.User
import org.catalyst.backend.requests.CreateConfigRequest
import org.catalyst.backend.requests.UpdateConfigRequest
import org.catalyst.backend.responses.ConfigResponse
import org.catalyst.backend.services.ConfigService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/configs")
class ConfigController(private val configService: ConfigService) {
    @GetMapping("/{id}")
    fun getConfigById(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ): ConfigResponse {
        return configService
            .getConfigForUser(id, user)
            .toResponse()
    }

    @GetMapping("/{id}/subscribe")
    fun subscribe(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ) {
        configService.subscribe(id, user)
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
        @RequestBody request: CreateConfigRequest
    ): ConfigResponse {
        return configService
            .createConfig(request.name, request.files, request.isPublic, user)
            .toResponse()
    }

    @PatchMapping("/{id}")
    fun updateConfig(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID,
        @RequestBody request: UpdateConfigRequest
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
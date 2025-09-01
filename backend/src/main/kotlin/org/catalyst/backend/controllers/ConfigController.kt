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
import org.catalyst.backend.requests.CreateConfigRequest
import org.catalyst.backend.requests.UpdateConfigRequest
import org.catalyst.backend.responses.ConfigFileResponse
import org.catalyst.backend.responses.ConfigResponse
import org.catalyst.backend.responses.ErrorResponse
import org.catalyst.backend.responses.SubscriptionResponse
import org.catalyst.backend.services.ConfigService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.*
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody

@RestController
@RequestMapping("/api/configs")
@Tag(name = "Configs", description = "Endpoints for managing configs")
class ConfigController(private val configService: ConfigService) {
    @GetMapping
    @Operation(summary = "Get a list of all public configs with pagination and filtering")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(array = ArraySchema(schema = Schema(implementation = ConfigResponse::class)))]
    )
    fun getPublicConfigs(
        @Parameter(description = "Number of configs to return per page")
        @RequestParam(value = "limit", required = false, defaultValue = "30")
        limit: Int,
        @Parameter(description = "Offset for pagination")
        @RequestParam(value = "offset", required = false, defaultValue = "0")
        offset: Int,
        @Parameter(description = "Filter configs by name or author")
        @RequestParam(value = "filter", required = false)
        filter: String?
    ): ResponseEntity<List<ConfigResponse>> {
        val page = configService.getPublicConfigs(limit, offset, filter)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a config by its ID")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(implementation = ConfigResponse::class))]
    )
    @CommonApiResponses
    fun getConfigById(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the config to retrieve")
        @PathVariable
        id: UUID
    ): ConfigResponse {
        return configService
            .getConfigForUser(id, user)
            .toResponse()
    }

    @GetMapping("/{id}/files")
    @Operation(summary = "Get a list of files for a specific config")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(array = ArraySchema(schema = Schema(implementation = ConfigFileResponse::class)))]
    )
    @CommonApiResponses
    fun getConfigFiles(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the config")
        @PathVariable
        id: UUID
    ): List<ConfigFileResponse> {
        return configService
            .getConfigForUser(id, user)
            .files
            .map { it.toResponse() }
    }

    @GetMapping("/{id}/files/{name}")
    @Operation(summary = "Get the content of a specific file within a config")
    @ApiResponse(responseCode = "200", description = "OK", content = [Content(mediaType = "text/plain")])
    @CommonApiResponses
    fun getConfigFile(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the config")
        @PathVariable
        id: UUID,
        @Parameter(description = "Name of the file to retrieve")
        @PathVariable
        name: String
    ): String {
        return configService
            .getConfigForUser(id, user)
            .files
            .first { it.name == name }
            .data
    }

    @GetMapping("/{id}/subscribe")
    @Operation(summary = "Subscribe the current user to a config")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(implementation = SubscriptionResponse::class))]
    )
    @CommonApiResponses
    fun subscribe(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the config to subscribe to")
        @PathVariable
        id: UUID
    ): SubscriptionResponse {
        return configService.subscribe(id, user).toResponse()
    }

    @GetMapping("/{id}/unsubscribe")
    @Operation(summary = "Unsubscribe the current user from a config")
    @ApiResponse(
        responseCode = "204",
        description = "No content (unsubscribed)",
        content = [Content(schema = Schema(implementation = ErrorResponse::class))]
    )
    @CommonApiResponses
    fun unsubscribe(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the config to unsubscribe from")
        @PathVariable
        id: UUID
    ) {
        configService.unsubscribe(id, user)
    }

    @PostMapping
    @Operation(summary = "Create a new config")
    @ApiResponse(
        responseCode = "201",
        description = "Config created",
        content = [Content(schema = Schema(implementation = ConfigResponse::class))]
    )
    @CommonApiResponses
    fun createConfig(
        @AuthenticationPrincipal
        user: User,
        @Valid
        @RequestBody
        @SwaggerRequestBody(description = "Config creation request payload", required = true)
        request: CreateConfigRequest
    ): ConfigResponse {
        return configService
            .createConfig(request.name, request.files, request.isPublic, user)
            .toResponse()
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an existing config")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(implementation = ConfigResponse::class))]
    )
    @CommonApiResponses
    fun updateConfig(
        @AuthenticationPrincipal user: User,
        @Parameter(description = "ID of the config to update") @PathVariable
        id: UUID,
        @Valid
        @RequestBody
        @SwaggerRequestBody(description = "Config update request payload", required = true)
        request: UpdateConfigRequest
    ): ConfigResponse {
        return configService
            .updateConfig(id, request.name, request.files, request.isPublic, user)
            .toResponse()
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing config")
    @ApiResponse(
        responseCode = "204",
        description = "No content (config deleted)",
        content = [Content(schema = Schema(implementation = ErrorResponse::class))]
    )
    @CommonApiResponses
    fun deleteConfig(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the config to delete")
        @PathVariable
        id: UUID
    ) {
        return configService.deleteConfigForUser(id, user)
    }
}
package org.catalyst.backend.controllers

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.catalyst.backend.configurations.annotations.CommonApiResponses
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.services.CapeService
import org.catalyst.common.responses.CapeResponse
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.io.IOException
import java.util.*

@RestController
@RequestMapping("/api/capes")
@Tag(name = "Capes", description = "Endpoints for managing capes")
class CapeController(private val capeService: CapeService) {
    @GetMapping
    @Operation(summary = "Get a list of all public capes with pagination, filtering and sorting")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(array = ArraySchema(schema = Schema(implementation = CapeResponse::class)))]
    )
    fun getCapes(
        @Parameter(description = "Number of capes to return per page")
        @RequestParam(
            value = "limit",
            required = false,
            defaultValue = "10"
        )
        limit: Int,
        @Parameter(description = "Offset for pagination")
        @RequestParam(
            value = "offset",
            required = false,
            defaultValue = "0"
        )
        offset: Int,
        @Parameter(description = "Filter capes by ID or name")
        @RequestParam(
            value = "filter",
            required = false
        )
        filter: String?,
        @Parameter(description = "Field to sort by (e.g., name)")
        @RequestParam(
            value = "sortBy",
            required = false
        )
        sortBy: String?
    ): ResponseEntity<List<CapeResponse>> {
        val page = capeService.getCapes(limit, offset, filter, sortBy)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a cape by its ID")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(implementation = CapeResponse::class))]
    )
    @CommonApiResponses
    fun getCapeById(
        @Parameter(description = "ID of the cape to retrieve")
        @PathVariable
        id: UUID
    ): CapeResponse {
        return capeService.getCapeById(id).toResponse()
    }

    @GetMapping("/{id}/select")
    @Operation(summary = "Select a cape for the current user", description = "User must be authenticated")
    @ApiResponse(responseCode = "200", description = "OK")
    @CommonApiResponses
    fun select(
        @AuthenticationPrincipal
        user: User,
        @Parameter(description = "ID of the cape to select")
        @PathVariable
        id: UUID
    ) {
        capeService.select(id, user)
    }

    @GetMapping("/{id}/image", produces = ["image/png"])
    @Operation(summary = "Get a cape's image by ID")
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = [Content(schema = Schema(type = "string", format = "binary"))]
    )
    @CommonApiResponses
    fun getCapeImage(
        @Parameter(description = "ID of the cape to get the image for")
        @PathVariable
        id: UUID
    ): ResponseEntity<ByteArrayResource> {
        val image = try {
            capeService.loadCapeImage(id)
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
}
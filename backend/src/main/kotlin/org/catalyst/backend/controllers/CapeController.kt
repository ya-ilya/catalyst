package org.catalyst.backend.controllers

import org.catalyst.backend.entities.user.User
import org.catalyst.backend.responses.CapeResponse
import org.catalyst.backend.services.CapeService
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
class CapeController(private val capeService: CapeService) {
    @GetMapping
    fun getCapes(
        @RequestParam(value = "limit", required = false, defaultValue = "10") limit: Int,
        @RequestParam(value = "offset", required = false, defaultValue = "0") offset: Int,
    ): ResponseEntity<List<CapeResponse>> {
        val page = capeService.getCapes(limit, offset)

        return ResponseEntity
            .status(HttpStatus.OK)
            .header("X-Total-Count", page.totalElements.toString())
            .header("X-Total-Pages", page.totalPages.toString())
            .header("Access-Control-Expose-Headers", "X-Total-Count,X-Total-Pages")
            .body(page.content.map { it.toResponse() })
    }

    @GetMapping("/{id}")
    fun getCapeById(@PathVariable id: UUID): CapeResponse {
        return capeService.getCapeById(id).toResponse()
    }

    @GetMapping("/{id}/select")
    fun select(
        @AuthenticationPrincipal user: User,
        @PathVariable id: UUID
    ) {
        capeService.select(id, user)
    }

    @GetMapping("/{id}/image", produces = ["image/png"])
    fun getCapeImage(@PathVariable id: UUID): ResponseEntity<ByteArrayResource> {
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
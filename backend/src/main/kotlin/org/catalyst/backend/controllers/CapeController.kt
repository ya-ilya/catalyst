package org.catalyst.backend.controllers

import org.catalyst.backend.responses.CapeResponse
import org.catalyst.backend.services.CapeService
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.io.IOException
import java.util.*

@RestController
@RequestMapping("/api/capes")
class CapeController(private val capeService: CapeService) {
    @GetMapping
    fun getCapes(): List<CapeResponse> {
        return capeService.getCapes().map { it.toResponse() }
    }

    @GetMapping("/{id}")
    fun getCapeById(@PathVariable id: UUID): CapeResponse {
        return capeService.getCapeById(id).toResponse()
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
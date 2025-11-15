package org.catalyst.backend.configurations.annotations

import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.catalyst.common.responses.ErrorResponse

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@ApiResponses(
    value = [
        ApiResponse(
            responseCode = "400",
            description = "Bad Request",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))]
        ),
        ApiResponse(
            responseCode = "401",
            description = "Unauthorized",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))]
        ),
        ApiResponse(
            responseCode = "403",
            description = "Forbidden",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))]
        ),
        ApiResponse(
            responseCode = "404",
            description = "Not Found",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))]
        ),
        ApiResponse(
            responseCode = "500",
            description = "Internal Server Error",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))]
        )
    ]
)
annotation class CommonApiResponses
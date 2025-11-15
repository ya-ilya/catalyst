package org.catalyst.backend.controllers

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.catalyst.backend.configurations.annotations.CommonApiResponses
import org.catalyst.backend.services.AuthenticationService
import org.catalyst.common.requests.RefreshTokenRequest
import org.catalyst.common.requests.SignInRequest
import org.catalyst.common.responses.AuthenticationResponse
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody

@RestController
@RequestMapping("/authentication")
@Tag(name = "Authentication", description = "Endpoints for user authentication and authorization")
class AuthenticationController(private val authenticationService: AuthenticationService) {
    @PostMapping("/sign-in")
    @Operation(summary = "Authenticate a user and get a session token")
    @ApiResponse(responseCode = "200", description = "OK")
    @CommonApiResponses
    fun signIn(
        @Valid
        @RequestBody
        @SwaggerRequestBody(description = "Sign in request payload", required = true)
        request: SignInRequest
    ): AuthenticationResponse {
        return authenticationService.signIn(request.username, request.password)
    }

    @PostMapping("/refreshToken")
    @Operation(summary = "Refresh an expired access token")
    @ApiResponse(responseCode = "200", description = "OK")
    @CommonApiResponses
    fun refreshToken(
        @Valid
        @RequestBody
        @SwaggerRequestBody(description = "Refresh token request payload", required = true)
        request: RefreshTokenRequest
    ): AuthenticationResponse {
        return authenticationService.refreshToken(request.refreshToken)
    }
}
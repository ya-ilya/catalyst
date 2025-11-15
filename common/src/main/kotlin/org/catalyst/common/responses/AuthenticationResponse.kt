package org.catalyst.common.responses

data class AuthenticationResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserResponse
)
package org.catalyst.backend.responses

class AuthenticationResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserResponse
)
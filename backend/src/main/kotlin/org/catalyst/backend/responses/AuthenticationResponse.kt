package org.catalyst.backend.responses

import java.util.*

class AuthenticationResponse(
    val accessToken: String,
    val refreshToken: String,
    val userId: UUID,
    val username: String
)
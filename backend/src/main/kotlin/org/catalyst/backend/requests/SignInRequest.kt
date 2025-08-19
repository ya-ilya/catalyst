package org.catalyst.backend.requests

import jakarta.validation.constraints.Size

class SignInRequest(
    @field:Size(min = 4, max = 32)
    val username: String,
    @field:Size(min = 8, max = 100)
    val password: String
)
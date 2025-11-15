package org.catalyst.common.requests

import jakarta.validation.constraints.Size

data class SignInRequest(
    @field:Size(min = 4, max = 32)
    val username: String,
    @field:Size(min = 8, max = 100)
    val password: String
)
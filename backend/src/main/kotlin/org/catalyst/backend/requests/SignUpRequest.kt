package org.catalyst.backend.requests

import jakarta.validation.constraints.Size

class SignUpRequest(
    @Size(min = 2, max = 20)
    val username: String,
    @Size(min = 8, max = 100)
    val password: String
)
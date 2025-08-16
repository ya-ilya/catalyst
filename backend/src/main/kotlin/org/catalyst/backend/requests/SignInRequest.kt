package org.catalyst.backend.requests

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size

class SignInRequest(
    @Email
    val email: String,
    @Size(min = 8, max = 100)
    val password: String
)
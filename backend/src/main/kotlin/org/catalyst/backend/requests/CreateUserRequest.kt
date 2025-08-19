package org.catalyst.backend.requests

import jakarta.validation.constraints.Size

class CreateUserRequest(
    @field:Size(min = 4, max = 32)
    val username: String
)
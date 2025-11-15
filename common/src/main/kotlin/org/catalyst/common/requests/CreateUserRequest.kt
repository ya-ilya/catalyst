package org.catalyst.common.requests

import jakarta.validation.constraints.Size

data class CreateUserRequest(
    @field:Size(min = 4, max = 32)
    val username: String
)
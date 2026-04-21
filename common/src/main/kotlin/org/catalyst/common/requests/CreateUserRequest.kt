package org.catalyst.common.requests

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Size

data class CreateUserRequest(
    @field:JsonProperty("username")
    @field:Size(min = 4, max = 32)
    val username: String? = null
)
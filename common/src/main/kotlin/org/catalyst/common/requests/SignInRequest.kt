package org.catalyst.common.requests

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Size

data class SignInRequest(
    @field:JsonProperty("username")
    @field:Size(min = 4, max = 32)
    val username: String? = null,
    @field:JsonProperty("password")
    @field:Size(min = 8, max = 100)
    val password: String? = null
)
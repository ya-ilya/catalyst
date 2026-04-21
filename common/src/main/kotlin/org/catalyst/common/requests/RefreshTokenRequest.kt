package org.catalyst.common.requests

import com.fasterxml.jackson.annotation.JsonProperty

data class RefreshTokenRequest(
    @field:JsonProperty("refreshToken")
    val refreshToken: String? = null
)
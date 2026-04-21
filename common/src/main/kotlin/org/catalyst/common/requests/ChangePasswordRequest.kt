package org.catalyst.common.requests

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Size

data class ChangePasswordRequest(
    @field:JsonProperty("oldPassword")
    @field:Size(min = 8, max = 100)
    val oldPassword: String? = null,
    @field:JsonProperty("newPassword")
    @field:Size(min = 8, max = 100)
    val newPassword: String? = null
)
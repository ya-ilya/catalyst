package org.catalyst.common.requests

import jakarta.validation.constraints.Size

data class ChangePasswordRequest(
    @field:Size(min = 8, max = 100)
    val oldPassword: String,
    @field:Size(min = 8, max = 100)
    val newPassword: String
)
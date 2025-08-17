package org.catalyst.backend.requests

import jakarta.validation.constraints.Size

class ChangePasswordRequest(
    @Size(min = 8, max = 100)
    val oldPassword: String,
    @Size(min = 8, max = 100)
    val newPassword: String
)
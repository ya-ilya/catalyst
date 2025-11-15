package org.catalyst.common.responses

import java.time.LocalDateTime
import java.util.*

data class UserResponse(
    val id: UUID,
    val username: String,
    val isAdmin: Boolean,
    val isPasswordChangeRequired: Boolean,
    val cape: CapeResponse?,
    val createdAt: LocalDateTime
)
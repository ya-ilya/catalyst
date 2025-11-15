package org.catalyst.common.responses

import java.time.LocalDateTime
import java.util.*

data class UserCreatedResponse(
    val id: UUID,
    val username: String,
    val temporaryPassword: String,
    val createdAt: LocalDateTime
)
package org.catalyst.backend.responses

import java.time.LocalDateTime
import java.util.*

class UserCreatedResponse(
    val id: UUID,
    val username: String,
    val temporaryPassword: String,
    val createdAt: LocalDateTime
)
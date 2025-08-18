package org.catalyst.backend.responses

import java.time.LocalDateTime
import java.util.*

class ConfigResponse(
    val id: UUID,
    val name: String,
    val isPublic: Boolean,
    val author: UserResponse,
    val lastUpdated: LocalDateTime,
    val createdAt: LocalDateTime
)
package org.catalyst.backend.responses

import java.time.LocalDateTime
import java.util.UUID

class ConfigResponse(
    val id: UUID,
    val name: String,
    val data: String,
    val isPublic: Boolean,
    val createdAt: LocalDateTime
)
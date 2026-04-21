package org.catalyst.common.responses

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime
import java.util.*

data class ConfigResponse(
    val id: UUID,
    val name: String,
    val tags: List<String>,
    @get:JsonProperty("isPublic")
    val isPublic: Boolean,
    val author: UserResponse,
    val lastUpdated: LocalDateTime,
    val createdAt: LocalDateTime
)
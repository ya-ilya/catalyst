package org.catalyst.common.responses

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime
import java.util.*

data class UserResponse(
    val id: UUID,
    val username: String,
    @get:JsonProperty("isAdmin")
    val isAdmin: Boolean,
    @get:JsonProperty("isPasswordChangeRequired")
    val isPasswordChangeRequired: Boolean,
    val cape: CapeResponse?,
    val createdAt: LocalDateTime
)
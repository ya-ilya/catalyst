package org.catalyst.backend.responses

import java.time.LocalDateTime
import java.util.*

class UserResponse(
    val id: UUID,
    val username: String,
    val registeredOn: LocalDateTime
)
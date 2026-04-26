package org.catalyst.common.responses

import java.util.UUID

data class UserProfileResponse(
    val id: UUID,
    val username: String,
    val minecraftUuid: UUID,
    val capeId: UUID?
)
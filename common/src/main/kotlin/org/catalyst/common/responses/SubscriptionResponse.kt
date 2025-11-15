package org.catalyst.common.responses

import java.time.LocalDateTime
import java.util.*

data class SubscriptionResponse(
    val id: UUID,
    val config: ConfigResponse,
    val subscribedAt: LocalDateTime
)
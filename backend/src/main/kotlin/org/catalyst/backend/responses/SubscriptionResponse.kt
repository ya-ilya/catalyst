package org.catalyst.backend.responses

import java.time.LocalDateTime
import java.util.*

class SubscriptionResponse(
    val id: UUID,
    val config: ConfigResponse,
    val subscribedAt: LocalDateTime
)
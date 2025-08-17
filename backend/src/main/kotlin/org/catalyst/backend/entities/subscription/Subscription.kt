package org.catalyst.backend.entities.subscription

import jakarta.persistence.*
import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.user.User
import java.time.LocalDateTime
import java.util.*

@Entity
class Subscription(
    @ManyToOne
    val user: User,
    @ManyToOne
    val config: Config,
    val subscribedAt: LocalDateTime,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
)
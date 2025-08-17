package org.catalyst.backend.entities.config.subscription

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.user.User
import java.time.LocalDateTime
import java.util.UUID

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
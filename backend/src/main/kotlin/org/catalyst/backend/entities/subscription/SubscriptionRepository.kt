package org.catalyst.backend.entities.subscription

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.user.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface SubscriptionRepository : JpaRepository<Subscription, UUID> {
    fun findByUserAndConfig(user: User, config: Config): Optional<Subscription>
    fun existsByUserAndConfig(user: User, config: Config): Boolean
}
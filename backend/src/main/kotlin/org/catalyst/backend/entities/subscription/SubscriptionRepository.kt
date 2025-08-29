package org.catalyst.backend.entities.subscription

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.user.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface SubscriptionRepository : JpaRepository<Subscription, UUID> {
    fun findByUser(user: User, pageable: Pageable): Page<Subscription>
    fun findByUserAndConfig(user: User, config: Config): Optional<Subscription>
    fun existsByUserAndConfig(user: User, config: Config): Boolean
}
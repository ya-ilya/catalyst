package org.catalyst.backend.entities.subscription

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.user.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.*

interface SubscriptionRepository : JpaRepository<Subscription, UUID> {
    @Query("""
        SELECT s FROM Subscription s
        WHERE s.user = :user AND (
            (:filter IS NULL) OR
            (LOWER(s.config.name) LIKE LOWER(CONCAT('%', :filter, '%'))) OR
            (LOWER(s.config.author.username) LIKE LOWER(CONCAT('%', :filter, '%')))
        )
    """)
    fun findFilteredByUser(
        user: User,
        filter: String?,
        pageable: Pageable
    ): Page<Subscription>

    fun findByUserAndConfig(user: User, config: Config): Optional<Subscription>
    fun existsByUserAndConfig(user: User, config: Config): Boolean
}
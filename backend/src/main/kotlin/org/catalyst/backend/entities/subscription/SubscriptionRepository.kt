package org.catalyst.backend.entities.subscription

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.user.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.*

interface SubscriptionRepository : JpaRepository<Subscription, UUID> {
    @Query(
        """
        SELECT s FROM Subscription s
        JOIN s.config c
        LEFT JOIN c.tags t
        WHERE s.user = :user AND (
            (:query IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND
            (:author IS NULL OR LOWER(c.author.username) LIKE LOWER(CONCAT('%', :author, '%'))) AND
            (:tags IS NULL OR LOWER(t) IN :tags)
        )
        GROUP BY s.id
    """
    )
    fun findFilteredByUser(
        @Param("user") user: User,
        @Param("query") query: String?,
        @Param("author") author: String?,
        @Param("tags") tags: List<String>?,
        pageable: Pageable
    ): Page<Subscription>

    fun findByUserAndConfig(user: User, config: Config): Optional<Subscription>
    fun existsByUserAndConfig(user: User, config: Config): Boolean
}
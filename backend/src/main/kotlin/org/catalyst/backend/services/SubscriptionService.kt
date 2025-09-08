package org.catalyst.backend.services

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.subscription.SubscriptionRepository
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.services.pagination.OffsetBasedPageRequest
import org.springframework.data.domain.Page
import org.springframework.data.jpa.domain.JpaSort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.time.ZoneOffset

@Service
class SubscriptionService(private val subscriptionRepository: SubscriptionRepository) {
    fun getByUserAndConfig(user: User, config: Config): Subscription {
        return subscriptionRepository
            .findByUserAndConfig(user, config)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found") }
    }

    fun findByUser(
        user: User,
        limit: Int,
        offset: Int,
        query: String?,
        author: String?,
        tags: List<String>?
    ): Page<Subscription> {
        val pageable = OffsetBasedPageRequest(offset, limit, JpaSort.by("subscribedAt"))

        val cleanQuery = query?.ifBlank { null }
        val cleanAuthor = author?.ifBlank { null }
        val cleanTags = tags?.ifEmpty { null }

        return subscriptionRepository.findFilteredByUser(
            user,
            cleanQuery,
            cleanAuthor,
            cleanTags,
            pageable
        )
    }

    fun existsByUserAndConfig(user: User, config: Config): Boolean {
        return subscriptionRepository.existsByUserAndConfig(user, config)
    }

    fun createSubscription(user: User, config: Config): Subscription {
        return subscriptionRepository.save(
            Subscription(
                user,
                config,
                LocalDateTime.now(
                    ZoneOffset.UTC
                )
            )
        )
    }

    fun deleteByUserAndConfig(user: User, config: Config) {
        subscriptionRepository.delete(
            getByUserAndConfig(user, config)
        )
    }
}
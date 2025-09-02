package org.catalyst.backend.services

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.config.ConfigFile
import org.catalyst.backend.entities.config.ConfigRepository
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.services.pagination.OffsetBasedPageRequest
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.jpa.domain.JpaSort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Service
class ConfigService(
    private val configRepository: ConfigRepository,
    private val subscriptionService: SubscriptionService
) {
    fun getConfigById(id: UUID): Config {
        return configRepository
            .findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Config not found") }
    }

    @Cacheable(value = ["publicConfigs"])
    fun getPublicConfigs(
        limit: Int,
        offset: Int,
        filter: String?
    ): Page<Config> {
        return configRepository.findFilteredPublicConfigs(
            filter,
            OffsetBasedPageRequest(offset, limit, JpaSort.by("createdAt"))
        )
    }

    fun getConfigForUser(id: UUID, user: User): Config {
        val config = getConfigById(id)

        if (!config.isPublic && config.author.id != user.id) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Config not found")
        }

        return config
    }

    fun subscribe(id: UUID, user: User): Subscription {
        val config = getConfigById(id)

        if (!config.isPublic) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Configuration not found")
        }

        if (subscriptionService.existsByUserAndConfig(user, config)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "You already subscribed to this configuration")
        }

        return subscriptionService.createSubscription(user, config)
    }

    fun unsubscribe(id: UUID, user: User) {
        val config = getConfigById(id)

        if (config.author.id == user.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot unsubscribe from your own configuration")
        }

        subscriptionService.deleteByUserAndConfig(user, config)
    }

    @CacheEvict(value = ["publicConfigs"], allEntries = true)
    fun createConfig(
        name: String,
        files: List<ConfigFile>,
        isPublic: Boolean,
        user: User
    ): Config {
        val date = LocalDateTime.now(ZoneOffset.UTC)

        val config = configRepository.save(
            Config(
                name,
                files,
                isPublic,
                date,
                date,
                user
            )
        )

        subscriptionService.createSubscription(user, config)

        return config
    }

    @CacheEvict(value = ["publicConfigs"], allEntries = true)
    fun updateConfig(
        id: UUID,
        name: String?,
        files: List<ConfigFile>?,
        isPublic: Boolean?,
        user: User
    ): Config {
        val config = getConfigById(id)

        if (config.author.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to edit this configuration")
        }

        return configRepository.save(
            config.apply {
                this.name = name ?: this.name
                this.files = files ?: this.files
                this.isPublic = isPublic ?: this.isPublic
                this.lastUpdated = LocalDateTime.now(ZoneOffset.UTC)
            }
        )
    }

    @Transactional
    @CacheEvict(value = ["publicConfigs"], allEntries = true)
    fun deleteConfigForUser(id: UUID, user: User) {
        val config = getConfigById(id)

        if (config.author.id != user.id && !user.isAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this configuration.")
        }

        configRepository.deleteById(id)
        configRepository.flush()
    }
}
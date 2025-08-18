package org.catalyst.backend.services

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.config.ConfigFile
import org.catalyst.backend.entities.config.ConfigRepository
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.subscription.SubscriptionRepository
import org.catalyst.backend.entities.user.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Service
class ConfigService(
    private val configRepository: ConfigRepository,
    private val subscriptionRepository: SubscriptionRepository
) {
    fun getConfigById(id: UUID): Config {
        return configRepository
            .findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Config not found") }
    }

    fun getConfigForUser(id: UUID, user: User): Config {
        val config = getConfigById(id)

        if (!config.isPublic && config.user.id != user.id) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Config not found")
        }

        return config
    }

    fun subscribe(id: UUID, user: User) {
        val config = getConfigById(id)

        if (!config.isPublic) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Configuration not found")
        }

        if (subscriptionRepository.existsByUserAndConfig(user, config)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "You already subscribed to this configuration")
        }

        subscriptionRepository.save(Subscription(user, config, LocalDateTime.now(ZoneOffset.UTC)))
    }

    fun unsubscribe(id: UUID, user: User) {
        val config = getConfigById(id)

        if (config.user.id == user.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot unsubscribe from your own configuration")
        }

        val subscription = subscriptionRepository
            .findByUserAndConfig(user, config)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found") }

        subscriptionRepository.delete(subscription)
    }

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

        subscriptionRepository.save(
            Subscription(
                user,
                config,
                date
            )
        )

        return config
    }

    fun updateConfig(
        id: UUID,
        name: String,
        files: List<ConfigFile>,
        user: User
    ): Config {
        val config = getConfigById(id)

        if (config.user.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to edit this configuration")
        }

        return configRepository.save(
            config.apply {
                this.name = name
                this.files = files
                this.lastUpdated = LocalDateTime.now(ZoneOffset.UTC)
            }
        )
    }

    fun deleteConfig(config: Config) {
        config.user.configs.removeIf { it.id == config.id }
        configRepository.deleteById(config.id!!)
        configRepository.flush()
    }

    fun deleteConfigForUser(id: UUID, user: User) {
        val config = getConfigById(id)

        if (config.user.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "ou are not authorized to delete this configuration.")
        }

        deleteConfig(config)
    }
}
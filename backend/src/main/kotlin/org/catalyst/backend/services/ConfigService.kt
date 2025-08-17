package org.catalyst.backend.services

import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.config.ConfigPart
import org.catalyst.backend.entities.config.ConfigRepository
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.subscription.SubscriptionRepository
import org.catalyst.backend.entities.user.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.UUID

@Service
class ConfigService(
    private val configRepository: ConfigRepository,
    private val subscriptionRepository: SubscriptionRepository
) {
    fun getConfigById(id: UUID): Config {
        return configRepository
            .findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
    }

    fun getConfigForUser(id: UUID, user: User): Config {
        val config = getConfigById(id)

        if (!config.isPublic && config.user.id != user.id) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        return config
    }

    fun subscribe(id: UUID, user: User): Config {
        val config = getConfigById(id)

        if (!config.isPublic) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        if (subscriptionRepository.existsByUserAndConfig(user, config)) {
            return config
        }

        subscriptionRepository.save(Subscription(user, config, LocalDateTime.now(ZoneOffset.UTC)))

        return config
    }

    fun createConfig(
        name: String,
        files: List<ConfigPart>,
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

    fun deleteConfig(config: Config) {
        config.user.createdConfigs.removeIf { it.id == config.id }
        configRepository.deleteById(config.id!!)
        configRepository.flush()
    }

    fun deleteConfigForUser(id: UUID, user: User) {
        val config = getConfigById(id)

        if (config.user.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        deleteConfig(config)
    }
}
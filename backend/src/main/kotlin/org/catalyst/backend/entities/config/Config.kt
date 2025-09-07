package org.catalyst.backend.entities.config

import jakarta.persistence.*
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.responses.ConfigResponse
import java.time.LocalDateTime
import java.util.*

@Entity
class Config(
    var name: String,
    @ElementCollection
    var files: List<ConfigFile>,
    @ElementCollection
    var tags: List<String>,
    var isPublic: Boolean,
    var lastUpdated: LocalDateTime,
    val createdAt: LocalDateTime,
    @ManyToOne
    val author: User,
    @OneToMany(
        mappedBy = "config",
        cascade = [CascadeType.REMOVE],
        orphanRemoval = true,
        fetch = FetchType.EAGER
    )
    val subscriptions: List<Subscription> = emptyList(),
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) {
    fun toResponse() = ConfigResponse(
        id!!,
        name,
        tags,
        isPublic,
        author.toResponse(),
        lastUpdated,
        createdAt
    )
}
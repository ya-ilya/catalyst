package org.catalyst.backend.entities.config

import jakarta.persistence.*
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.responses.ConfigResponse
import java.time.LocalDateTime
import java.util.*

@Entity
class Config(
    var name: String,
    @ElementCollection(fetch = FetchType.EAGER)
    var files: List<ConfigFile>,
    val isPublic: Boolean,
    var lastUpdated: LocalDateTime,
    val createdAt: LocalDateTime,
    @ManyToOne
    val author: User,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) {
    fun toResponse() = ConfigResponse(
        id!!,
        name,
        isPublic,
        author.toResponse(),
        lastUpdated,
        createdAt
    )
}
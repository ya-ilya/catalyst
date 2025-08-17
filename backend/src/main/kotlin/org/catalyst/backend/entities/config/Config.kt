package org.catalyst.backend.entities.config

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.responses.ConfigResponse
import java.time.LocalDateTime
import java.util.UUID

@Entity
class Config(
    val name: String,
    val data: String,
    val isPublic: Boolean,
    val createdAt: LocalDateTime,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) {
    fun toResponse() = ConfigResponse(
        id!!,
        name,
        data,
        isPublic,
        createdAt
    )
}
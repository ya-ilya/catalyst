package org.catalyst.backend.entities.cape

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import org.catalyst.backend.responses.CapeResponse
import java.util.UUID

@Entity
class Cape(
    val name: String,
    val description: String,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) {
    fun toResponse() = CapeResponse(
        id!!,
        name,
        description
    )
}
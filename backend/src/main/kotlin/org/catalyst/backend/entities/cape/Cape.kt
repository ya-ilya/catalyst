package org.catalyst.backend.entities.cape

import jakarta.persistence.*
import org.catalyst.backend.entities.user.User
import org.catalyst.common.responses.CapeResponse
import java.util.*

@Entity
class Cape(
    val name: String,
    val description: String,
    @OneToMany(mappedBy = "cape")
    val users: MutableList<User> = mutableListOf(),
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
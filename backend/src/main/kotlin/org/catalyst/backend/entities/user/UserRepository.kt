package org.catalyst.backend.entities.user

import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface UserRepository : JpaRepository<User, UUID> {
    fun findByUsername(username: String): Optional<User>
}
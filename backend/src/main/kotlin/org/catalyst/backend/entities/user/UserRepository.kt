package org.catalyst.backend.entities.user

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.*

interface UserRepository : JpaRepository<User, UUID> {
    @Query("""
        SELECT u FROM User u
        WHERE (:filter IS NULL) OR 
        (LOWER(u.username) LIKE LOWER(CONCAT('%', :filter, '%')))
    """)
    fun findFilteredUsers(
        filter: String?,
        pageable: Pageable
    ): Page<User>

    fun findByUsername(username: String): Optional<User>
}
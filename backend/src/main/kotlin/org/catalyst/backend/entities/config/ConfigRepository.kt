package org.catalyst.backend.entities.config

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.*

interface ConfigRepository : JpaRepository<Config, UUID> {
    @Query("""
        SELECT c FROM Config c
        WHERE c.isPublic = true AND (
            (:filter IS NULL) OR
            (LOWER(c.name) LIKE LOWER(CONCAT('%', :filter, '%'))) OR
            (LOWER(c.author.username) LIKE LOWER(CONCAT('%', :filter, '%')))
        )
    """)
    fun findFilteredPublicConfigs(
        filter: String?,
        pageable: Pageable
    ): Page<Config>
}
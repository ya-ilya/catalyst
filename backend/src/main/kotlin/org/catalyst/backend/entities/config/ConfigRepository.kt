package org.catalyst.backend.entities.config

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.*

interface ConfigRepository : JpaRepository<Config, UUID> {
    @Query(
        """
        SELECT c FROM Config c
        LEFT JOIN c.tags t
        WHERE c.isPublic = true AND (
            (:query IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND
            (:author IS NULL OR LOWER(c.author.username) LIKE LOWER(CONCAT('%', :author, '%'))) AND
            (:tags IS NULL or LOWER(t) IN :tags)
        )
        GROUP BY c.id
    """
    )
    fun findFilteredPublicConfigs(
        @Param("query") query: String?,
        @Param("author") author: String?,
        @Param("tags") tags: List<String>?,
        pageable: Pageable
    ): Page<Config>
}
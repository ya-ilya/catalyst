package org.catalyst.backend.entities.config

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ConfigRepository : JpaRepository<Config, UUID> {
    fun findByIsPublicTrue(pageable: Pageable): Page<Config>
}
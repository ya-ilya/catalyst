package org.catalyst.backend.entities.config

import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ConfigRepository : JpaRepository<Config, UUID> {
    fun findByIsPublicTrue(): List<Config>
}
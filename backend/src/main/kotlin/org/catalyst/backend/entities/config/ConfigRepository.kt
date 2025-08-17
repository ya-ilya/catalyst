package org.catalyst.backend.entities.config

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ConfigRepository : JpaRepository<Config, UUID>
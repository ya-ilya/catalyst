package org.catalyst.backend.entities.config

import jakarta.persistence.Embeddable

@Embeddable
class ConfigFile(
    val name: String,
    val data: String
)
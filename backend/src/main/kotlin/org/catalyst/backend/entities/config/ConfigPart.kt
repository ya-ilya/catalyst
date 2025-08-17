package org.catalyst.backend.entities.config

import jakarta.persistence.Embeddable

@Embeddable
class ConfigPart(
    val name: String,
    val data: String
)
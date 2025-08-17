package org.catalyst.backend.entities.config

import jakarta.persistence.Embeddable

@Embeddable
class ConfigPart(
    val fileName: String,
    val fileData: String
)
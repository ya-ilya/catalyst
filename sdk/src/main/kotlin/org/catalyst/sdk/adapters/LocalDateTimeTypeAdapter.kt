package org.catalyst.sdk.adapters

import com.google.gson.*
import java.lang.reflect.Type
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object LocalDateTimeTypeAdapter : JsonSerializer<LocalDateTime?>, JsonDeserializer<LocalDateTime?> {
    private val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")

    override fun serialize(
        p0: LocalDateTime?,
        p1: Type?,
        p2: JsonSerializationContext?
    ): JsonElement? {
        return JsonPrimitive(formatter.format(p0))
    }

    override fun deserialize(
        p0: JsonElement?,
        p1: Type?,
        p2: JsonDeserializationContext?
    ): LocalDateTime? {
        return LocalDateTime.parse(p0!!.asString, formatter)
    }
}
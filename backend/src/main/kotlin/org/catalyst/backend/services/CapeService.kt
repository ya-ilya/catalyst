package org.catalyst.backend.services

import jakarta.transaction.Transactional
import org.catalyst.backend.entities.cape.Cape
import org.catalyst.backend.entities.cape.CapeRepository
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.services.pagination.OffsetBasedPageRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.cache.annotation.Caching
import org.springframework.data.domain.Page
import org.springframework.data.jpa.domain.JpaSort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.ByteArrayInputStream
import java.io.File
import java.io.IOException
import java.util.*

@Service
class CapeService(
    private val capeRepository: CapeRepository,
    private val userService: UserService
) {
    private companion object {
        val PNG_MAGIC_NUMBERS = byteArrayOf(
            0x89.toByte(), 0x50.toByte(), 0x4E.toByte(), 0x47.toByte(),
            0x0D.toByte(), 0x0A.toByte(), 0x1A.toByte(), 0x0A.toByte()
        )

        const val MAX_CAPE_IMAGE_SIZE = 100 * 1024L
    }

    @Value($$"${catalyst.capes.directory}")
    private val capesDirectory: String? = null

    fun getCapeById(id: UUID): Cape {
        return capeRepository
            .findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Cape not found") }
    }

    @Cacheable(value = ["capes"])
    fun getCapes(
        limit: Int,
        offset: Int,
        filter: String?,
        sortBy: String?
    ): Page<Cape> {
        val sortField = when (sortBy) {
            "name" -> "name"
            else -> null
        }

        val pageable = OffsetBasedPageRequest(
            offset,
            limit,
            if (sortField != null) JpaSort.by(sortField) else JpaSort.unsorted()
        )

        return capeRepository.findFilteredCapes(
            filter,
            pageable
        )
    }

    fun select(id: UUID, user: User) {
        val cape = getCapeById(id)

        if (user.cape?.id == id) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "This cape already selected by you")
        }

        userService.updateUser(user.apply {
            this.cape = cape
        })
    }

    fun unselect(user: User) {
        userService.updateUser(user.apply {
            this.cape = null
        })
    }

    @CacheEvict(value = ["capes"], allEntries = true)
    fun createCape(
        name: String,
        description: String,
        image: MultipartFile
    ): Cape {
        if (image.size > MAX_CAPE_IMAGE_SIZE) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Too big cape file size")
        }

        val buffer = ByteArray(PNG_MAGIC_NUMBERS.size)
        ByteArrayInputStream(image.bytes).use { fis ->
            val bytesRead = fis.read(buffer)
            if (bytesRead != PNG_MAGIC_NUMBERS.size || !buffer.contentEquals(PNG_MAGIC_NUMBERS)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Cape image must be in png format")
            }
        }

        val cape = capeRepository.save(
            Cape(
                name,
                description
            )
        )

        saveCapeImage(cape, image)

        return cape
    }

    @Transactional
    @Caching(
        evict = [
            CacheEvict(value = ["capes"], allEntries = true),
            CacheEvict(value = ["capeImages"], key = "#id")
        ]
    )
    fun deleteCapeById(id: UUID) {
        val cape = getCapeById(id)

        for (user in cape.users) {
            userService.updateUser(user.apply {
                this.cape = null
            })
        }

        deleteCapeImage(cape)
        capeRepository.delete(cape)
    }

    @Cacheable(value = ["capeImages"], key = "#id")
    fun loadCapeImage(id: UUID): ByteArray {
        val cape = getCapeById(id)

        val filePath = "${capesDirectory}/${cape.id}.png"

        val file = File(filePath)
        if (!file.exists() || !file.canRead()) {
            throw IOException("File for cape with ID $id not found or is unreadable.")
        }

        return file.readBytes()
    }

    private fun saveCapeImage(cape: Cape, image: MultipartFile) {
        val file = File("${capesDirectory}/${cape.id}.png")
        file.mkdirs()
        image.transferTo(file)
    }

    private fun deleteCapeImage(cape: Cape) {
        File("${capesDirectory}/${cape.id}.png").delete()
    }
}
package org.catalyst.backend.services

import jakarta.transaction.Transactional
import org.catalyst.backend.entities.cape.Cape
import org.catalyst.backend.entities.cape.CapeRepository
import org.catalyst.backend.entities.user.User
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.io.IOException
import java.util.*

@Service
class CapeService(
    private val capeRepository: CapeRepository,
    private val userService: UserService
) {
    @Value($$"${catalyst.capes.directory}")
    private val capesDirectory: String? = null

    fun getCapeById(id: UUID): Cape {
        return capeRepository
            .findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Cape not found") }
    }

    fun getCapes(): List<Cape> {
        return capeRepository.findAll()
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

    fun createCape(
        name: String,
        description: String,
        image: MultipartFile
    ): Cape {
        if (image.size > 100 * 1024L) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Too big cape file size")
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
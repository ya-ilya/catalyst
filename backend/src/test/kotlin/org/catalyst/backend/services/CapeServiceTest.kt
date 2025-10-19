package org.catalyst.backend.services

import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.justRun
import io.mockk.verify
import org.catalyst.backend.entities.cape.Cape
import org.catalyst.backend.entities.cape.CapeRepository
import org.catalyst.backend.entities.user.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.assertNotNull
import org.junit.jupiter.api.assertNull
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.io.TempDir
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockMultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.io.IOException
import java.nio.file.Path
import java.time.LocalDateTime
import java.util.*
import kotlin.test.BeforeTest
import kotlin.test.Test

@ExtendWith(MockKExtension::class)
class CapeServiceTest {

    // --- Mocks and Service Under Test ---

    @MockK
    private lateinit var capeRepository: CapeRepository

    @MockK
    private lateinit var userService: UserService

    @InjectMockKs(overrideValues = true)
    private lateinit var capeService: CapeService

    // --- Test Setup ---

    @TempDir
    lateinit var tempDir: Path

    private val validPngBytes = byteArrayOf(
        0x89.toByte(), 0x50.toByte(), 0x4E.toByte(), 0x47.toByte(),
        0x0D.toByte(), 0x0A.toByte(), 0x1A.toByte(), 0x0A.toByte(),
        0x00.toByte()
    )

    @BeforeTest
    fun setUp() {
        val field = CapeService::class.java.getDeclaredField("capesDirectory")
        field.isAccessible = true
        field.set(capeService, tempDir.toString())
    }


    // --- Tests for getCapeById ---

    @Test
    fun `getCapeById should return cape when found`() {
        val capeId = UUID.randomUUID()
        val mockCape = Cape("Test Cape", "A cool cape", id = capeId)
        every { capeRepository.findById(capeId) } returns Optional.of(mockCape)

        val result = capeService.getCapeById(capeId)

        assertNotNull(result)
        assertEquals(capeId, result.id)
        assertEquals("Test Cape", result.name)
    }

    @Test
    fun `getCapeById should throw ResponseStatusException when not found`() {
        val capeId = UUID.randomUUID()
        every { capeRepository.findById(capeId) } returns Optional.empty()

        val exception = assertThrows<ResponseStatusException> {
            capeService.getCapeById(capeId)
        }
        assertEquals(HttpStatus.NOT_FOUND, exception.statusCode)
    }


    // --- Tests for select & unselect ---

    @Test
    fun `select should update user with new cape`() {
        val user = User("testuser", "pass", LocalDateTime.now())
        user.cape = null
        val capeId = UUID.randomUUID()
        val mockCape = Cape("New Cape", "A new cape", id = capeId)

        every { capeRepository.findById(capeId) } returns Optional.of(mockCape)
        every { userService.updateUser(any()) } returns user

        capeService.select(capeId, user)

        verify {
            userService.updateUser(withArg { updatedUser ->
                assertEquals(capeId, updatedUser.cape?.id)
            })
        }
    }

    @Test
    fun `select should throw Conflict when cape is already selected`() {
        val capeId = UUID.randomUUID()
        val mockCape = Cape("New Cape", "", id = capeId)
        val user = User("testuser", "pass", LocalDateTime.now())
        user.cape = mockCape

        every { capeRepository.findById(capeId) } returns Optional.of(mockCape)

        val exception = assertThrows<ResponseStatusException> {
            capeService.select(capeId, user)
        }
        assertEquals(HttpStatus.CONFLICT, exception.statusCode)
    }

    @Test
    fun `unselect should update user with null cape`() {
        val mockCape = Cape("Some Cape", "", id = UUID.randomUUID())
        val user = User("testuser", "pass", LocalDateTime.now())
        user.cape = mockCape

        every { userService.updateUser(any()) } returns user

        capeService.unselect(user)

        verify {
            userService.updateUser(withArg { updatedUser ->
                assertNull(updatedUser.cape)
            })
        }
    }


    // --- Tests for createCape ---

    @Test
    fun `createCape should save cape and image when data is valid`() {
        val capeId = UUID.randomUUID()
        val savedCape = Cape("New Cape", "Desc", id = capeId)
        val image = MockMultipartFile("file", "cape.png", "image/png", validPngBytes)

        every { capeRepository.save(any()) } returns savedCape

        val result = capeService.createCape("New Cape", "Desc", image)

        assertEquals(savedCape.id, result.id)
        verify { capeRepository.save(any()) }

        val savedImageFile = File(tempDir.toString(), "${savedCape.id}.png")
        assertTrue(savedImageFile.exists())
        assertArrayEquals(validPngBytes, savedImageFile.readBytes())
    }

    @Test
    fun `createCape should throw BadRequest when image is too large`() {
        val largeFileContent = ByteArray(101 * 1024)
        val image = MockMultipartFile("file", "cape.png", "image/png", largeFileContent)

        val exception = assertThrows<ResponseStatusException> {
            capeService.createCape("Cape", "Desc", image)
        }
        assertEquals(HttpStatus.BAD_REQUEST, exception.statusCode)
        assertTrue(exception.reason!!.contains("Too big cape file size"))
    }

    @Test
    fun `createCape should throw BadRequest when image is not PNG`() {
        val invalidBytes = byteArrayOf(1, 2, 3, 4, 5, 6, 7, 8)
        val image = MockMultipartFile("file", "cape.jpg", "image/jpeg", invalidBytes)

        val exception = assertThrows<ResponseStatusException> {
            capeService.createCape("Cape", "Desc", image)
        }
        assertEquals(HttpStatus.BAD_REQUEST, exception.statusCode)
        assertTrue(exception.reason!!.contains("must be in png format"))
    }


    // --- Tests for deleteCapeById ---

    @Test
    fun `deleteCapeById should unselect cape, delete image and cape entity`() {
        val capeId = UUID.randomUUID()
        val user1 = User("user1", "pass", LocalDateTime.now())
        val user2 = User("user2", "pass", LocalDateTime.now())
        val capeToDelete = Cape("Old Cape", "", id = capeId)

        user1.cape = capeToDelete
        user2.cape = capeToDelete
        capeToDelete.users.addAll(listOf(user1, user2))

        val imageFile = File(tempDir.toString(), "${capeToDelete.id}.png")
        imageFile.createNewFile()
        assertTrue(imageFile.exists())

        every { capeRepository.findById(capeId) } returns Optional.of(capeToDelete)
        every { userService.updateUser(any()) } returnsArgument 0
        justRun { capeRepository.delete(capeToDelete) }

        capeService.deleteCapeById(capeId)

        verify(exactly = 2) { userService.updateUser(any()) }
        verify(exactly = 1) { capeRepository.delete(capeToDelete) }
        assertFalse(imageFile.exists())
    }


    // --- Tests for loadCapeImage ---

    @Test
    fun `loadCapeImage should return byte array when image exists`() {
        val capeId = UUID.randomUUID()
        val cape = Cape("Test Cape", "", id = capeId)
        val imageFile = File(tempDir.toString(), "${cape.id}.png")
        imageFile.writeBytes(validPngBytes)

        every { capeRepository.findById(capeId) } returns Optional.of(cape)

        val resultBytes = capeService.loadCapeImage(capeId)

        assertArrayEquals(validPngBytes, resultBytes)
    }

    @Test
    fun `loadCapeImage should throw IOException when image file does not exist`() {
        val capeId = UUID.randomUUID()
        val cape = Cape("Test Cape", "", id = capeId)
        every { capeRepository.findById(capeId) } returns Optional.of(cape)

        assertThrows<IOException> {
            capeService.loadCapeImage(capeId)
        }
    }
}
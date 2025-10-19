package org.catalyst.backend.services

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.config.ConfigFile
import org.catalyst.backend.entities.config.ConfigRepository
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.entities.user.role.Role
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockKExtension::class)
class ConfigServiceTest {

    // --- Mocks and Service Under Test ---

    @MockK
    private lateinit var configRepository: ConfigRepository

    @MockK
    private lateinit var subscriptionService: SubscriptionService

    @InjectMockKs
    private lateinit var configService: ConfigService

    // --- Test Data ---

    private lateinit var authorUser: User
    private lateinit var regularUser: User
    private lateinit var adminUser: User
    private lateinit var privateConfig: Config
    private lateinit var publicConfig: Config

    private val privateConfigId = UUID.randomUUID()
    private val publicConfigId = UUID.randomUUID()

    @BeforeEach
    fun setUp() {
        val adminRole = Role("ROLE_ADMIN", id = 1L)
        val now = LocalDateTime.now()

        authorUser = User("author", "pass", now, id = UUID.randomUUID())
        regularUser = User("user", "pass", now, id = UUID.randomUUID())
        adminUser = User("admin", "pass", now, roles = setOf(adminRole), id = UUID.randomUUID())

        privateConfig = Config("Private", listOf(), mutableListOf(), false, now, now, authorUser, id = privateConfigId)
        publicConfig = Config("Public", listOf(), mutableListOf(), true, now, now, authorUser, id = publicConfigId)
    }


    // --- Tests for getConfigForUser ---

    @Test
    fun `getConfigForUser should return public config for any user`() {
        every { configRepository.findById(publicConfigId) } returns Optional.of(publicConfig)
        val result = configService.getConfigForUser(publicConfigId, regularUser)
        assertNotNull(result)
    }

    @Test
    fun `getConfigForUser should return private config for author`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        val result = configService.getConfigForUser(privateConfigId, authorUser)
        assertNotNull(result)
    }

    @Test
    fun `getConfigForUser should throw NotFound for private config and regular user`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        val ex = assertThrows<ResponseStatusException> {
            configService.getConfigForUser(privateConfigId, regularUser)
        }
        assertEquals(HttpStatus.NOT_FOUND, ex.statusCode)
    }


    // --- Tests for subscribe / unsubscribe ---

    @Test
    fun `subscribe should succeed for public config`() {
        val mockSubscription = Subscription(regularUser, publicConfig, LocalDateTime.now())
        every { configRepository.findById(publicConfigId) } returns Optional.of(publicConfig)
        every { subscriptionService.existsByUserAndConfig(regularUser, publicConfig) } returns false
        every { subscriptionService.createSubscription(regularUser, publicConfig) } returns mockSubscription

        configService.subscribe(publicConfigId, regularUser)
        verify { subscriptionService.createSubscription(regularUser, publicConfig) }
    }

    @Test
    fun `subscribe should throw NotFound for private config`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        assertThrows<ResponseStatusException> {
            configService.subscribe(privateConfigId, regularUser)
        }
    }

    @Test
    fun `subscribe should throw Conflict if already subscribed`() {
        every { configRepository.findById(publicConfigId) } returns Optional.of(publicConfig)
        every { subscriptionService.existsByUserAndConfig(regularUser, publicConfig) } returns true
        assertThrows<ResponseStatusException> {
            configService.subscribe(publicConfigId, regularUser)
        }
    }

    @Test
    fun `unsubscribe should throw BadRequest when author tries to unsubscribe`() {
        every { configRepository.findById(publicConfigId) } returns Optional.of(publicConfig)
        val ex = assertThrows<ResponseStatusException> {
            configService.unsubscribe(publicConfigId, authorUser)
        }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }


    // --- Tests for createConfig ---

    @Test
    fun `createConfig should save config and create subscription for author`() {
        val configSlot = slot<Config>()
        every { configRepository.save(capture(configSlot)) } answers { configSlot.captured }
        every { subscriptionService.createSubscription(any(), any()) } returns mockk()

        val newFiles = listOf(ConfigFile("file.txt", "data"))
        configService.createConfig("New", newFiles, true, authorUser)

        verify(exactly = 1) { configRepository.save(any()) }
        verify(exactly = 1) { subscriptionService.createSubscription(authorUser, configSlot.captured) }
        assertEquals("New", configSlot.captured.name)
        assertEquals(authorUser, configSlot.captured.author)
    }


    // --- Tests for updateConfig ---

    @Test
    fun `updateConfig should succeed for author`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        every { configRepository.save(any()) } answers { firstArg() }
        val newTags = listOf("updated")

        val result = configService.updateConfig(privateConfigId, "Updated Name", newTags, null, true, authorUser)

        assertEquals("Updated Name", result.name)
        assertEquals(newTags, result.tags)
        assertTrue(result.isPublic)
        assertNotEquals(result.createdAt, result.lastUpdated)
    }

    @Test
    fun `updateConfig should succeed for admin`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        every { configRepository.save(any()) } answers { firstArg() }

        val result = configService.updateConfig(privateConfigId, "Updated by Admin", null, null, null, adminUser)
        assertEquals("Updated by Admin", result.name)
    }

    @Test
    fun `updateConfig should throw Forbidden for regular user`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        assertThrows<ResponseStatusException> {
            configService.updateConfig(privateConfigId, "New Name", null, null, null, regularUser)
        }
    }

    @Test
    fun `updateConfig should throw BadRequest if tag contains space`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        val invalidTags = listOf("invalid tag")
        assertThrows<ResponseStatusException> {
            configService.updateConfig(privateConfigId, null, invalidTags, null, null, authorUser)
        }
    }

    // --- Tests for deleteConfigForUser ---

    @Test
    fun `deleteConfigForUser should succeed for author`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        justRun { configRepository.deleteById(privateConfigId) }
        justRun { configRepository.flush() }

        configService.deleteConfigForUser(privateConfigId, authorUser)

        verify(exactly = 1) { configRepository.deleteById(privateConfigId) }
        verify(exactly = 1) { configRepository.flush() }
    }

    @Test
    fun `deleteConfigForUser should succeed for admin`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        justRun { configRepository.deleteById(privateConfigId) }
        justRun { configRepository.flush() }

        configService.deleteConfigForUser(privateConfigId, adminUser)
        verify(exactly = 1) { configRepository.deleteById(privateConfigId) }
    }

    @Test
    fun `deleteConfigForUser should throw Forbidden for regular user`() {
        every { configRepository.findById(privateConfigId) } returns Optional.of(privateConfig)
        assertThrows<ResponseStatusException> {
            configService.deleteConfigForUser(privateConfigId, regularUser)
        }
    }
}
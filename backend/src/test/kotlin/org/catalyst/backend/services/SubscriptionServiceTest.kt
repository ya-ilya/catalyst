package org.catalyst.backend.services

import io.mockk.*
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.subscription.SubscriptionRepository
import org.catalyst.backend.entities.user.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockKExtension::class)
class SubscriptionServiceTest {

    // --- Mocks and Service Under Test ---

    @MockK
    private lateinit var subscriptionRepository: SubscriptionRepository

    @InjectMockKs
    private lateinit var subscriptionService: SubscriptionService

    // --- Test Data ---

    private lateinit var testUser: User
    private lateinit var testConfig: Config
    private lateinit var mockSubscription: Subscription

    @BeforeEach
    fun setUp() {
        val now = LocalDateTime.now()
        testUser = User("user", "pass", now, id = UUID.randomUUID())
        testConfig = Config("config", listOf(), listOf(), true, now, now, testUser, id = UUID.randomUUID())
        mockSubscription = Subscription(testUser, testConfig, now, id = UUID.randomUUID())
    }

    // --- Tests for getByUserAndConfig ---

    @Test
    fun `getByUserAndConfig should return subscription when found`() {
        every { subscriptionRepository.findByUserAndConfig(testUser, testConfig) } returns Optional.of(mockSubscription)

        val result = subscriptionService.getByUserAndConfig(testUser, testConfig)

        assertNotNull(result)
        assertEquals(mockSubscription.id, result.id)
    }

    @Test
    fun `getByUserAndConfig should throw NotFound when subscription does not exist`() {
        every { subscriptionRepository.findByUserAndConfig(testUser, testConfig) } returns Optional.empty()

        assertThrows<ResponseStatusException> {
            subscriptionService.getByUserAndConfig(testUser, testConfig)
        }
    }

    // --- Tests for findByUser ---

    @Test
    fun `findByUser should call repository with cleaned and correct parameters`() {
        val pageableSlot = slot<Pageable>()
        every {
            subscriptionRepository.findFilteredByUser(
                user = eq(testUser),
                query = isNull(),
                author = eq("authorName"),
                tags = isNull(),
                pageable = capture(pageableSlot)
            )
        } returns Page.empty()

        subscriptionService.findByUser(
            user = testUser,
            limit = 10,
            offset = 0,
            query = "  ",
            author = "authorName",
            tags = emptyList(),
            sortBy = "config.name"
        )

        verify(exactly = 1) { subscriptionRepository.findFilteredByUser(any(), any(), any(), any(), any()) }
        assertTrue(pageableSlot.captured.sort.isSorted)
        assertEquals("config.name", pageableSlot.captured.sort.getOrderFor("config.name")?.property)
    }

    // --- Tests for existsByUserAndConfig ---

    @Test
    fun `existsByUserAndConfig should return true when repository returns true`() {
        every { subscriptionRepository.existsByUserAndConfig(testUser, testConfig) } returns true
        assertTrue(subscriptionService.existsByUserAndConfig(testUser, testConfig))
    }

    @Test
    fun `existsByUserAndConfig should return false when repository returns false`() {
        every { subscriptionRepository.existsByUserAndConfig(testUser, testConfig) } returns false
        assertFalse(subscriptionService.existsByUserAndConfig(testUser, testConfig))
    }

    // --- Tests for createSubscription ---

    @Test
    fun `createSubscription should save a new subscription`() {
        val subscriptionSlot = slot<Subscription>()
        every { subscriptionRepository.save(capture(subscriptionSlot)) } returns mockSubscription

        val result = subscriptionService.createSubscription(testUser, testConfig)

        assertNotNull(result)
        assertEquals(testUser, subscriptionSlot.captured.user)
        assertEquals(testConfig, subscriptionSlot.captured.config)
        assertNotNull(subscriptionSlot.captured.subscribedAt)
        verify(exactly = 1) { subscriptionRepository.save(any()) }
    }

    // --- Tests for deleteByUserAndConfig ---

    @Test
    fun `deleteByUserAndConfig should delete subscription when it exists`() {
        val spykService = spyk(subscriptionService)
        every { spykService.getByUserAndConfig(testUser, testConfig) } returns mockSubscription
        justRun { subscriptionRepository.delete(mockSubscription) }

        spykService.deleteByUserAndConfig(testUser, testConfig)

        verify(exactly = 1) { subscriptionRepository.delete(mockSubscription) }
    }

    @Test
    fun `deleteByUserAndConfig should throw exception when subscription to delete is not found`() {
        val spykService = spyk(subscriptionService)
        every { spykService.getByUserAndConfig(testUser, testConfig) } throws
                ResponseStatusException(HttpStatus.NOT_FOUND)

        assertThrows<ResponseStatusException> {
            spykService.deleteByUserAndConfig(testUser, testConfig)
        }
        verify(exactly = 0) { subscriptionRepository.delete(any()) }
    }
}
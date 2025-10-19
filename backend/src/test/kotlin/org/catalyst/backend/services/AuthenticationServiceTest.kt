package org.catalyst.backend.services

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Encoders
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.slot
import io.mockk.verify
import org.catalyst.backend.entities.user.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockKExtension::class)
class AuthenticationServiceTest {

    @MockK
    private lateinit var userService: UserService

    @MockK
    private lateinit var passwordEncoder: PasswordEncoder

    @InjectMockKs
    private lateinit var authenticationService: AuthenticationService

    private lateinit var testUser: User
    private val testPassword = "password123"
    private val encodedPassword = "encodedPassword123"

    @BeforeEach
    fun setUp() {
        val secretKey = Jwts.SIG.HS256.key().build()
        val base64Key = Encoders.BASE64.encode(secretKey.encoded)

        val field = AuthenticationService::class.java.getDeclaredField("jwtSigningKey")
        field.isAccessible = true
        field.set(authenticationService, base64Key)

        testUser = User("testuser", encodedPassword, LocalDateTime.now(), id = UUID.randomUUID())
    }

    // --- Tests for signIn ---

    @Test
    fun `signIn should return tokens when credentials are valid`() {
        every { userService.findUserByUsername(testUser.username) } returns Optional.of(testUser)
        every { passwordEncoder.matches(testPassword, encodedPassword) } returns true
        every { userService.updateUser(any()) } returns testUser
        every { passwordEncoder.encode(any<String>()) } returns "hashedRefreshToken"

        val response = authenticationService.signIn(testUser.username, testPassword)

        assertNotNull(response.accessToken)
        assertNotNull(response.refreshToken)
        assertEquals(testUser.id, response.user.id)
    }

    // --- Tests for changePassword ---

    @Test
    fun `changePassword should succeed with valid old password`() {
        val newPassword = "newPassword456"
        val newEncodedPassword = "newEncodedPassword456"
        val capturedUsers = mutableListOf<User>()

        every { passwordEncoder.matches(testPassword, encodedPassword) } returns true
        every { passwordEncoder.encode(newPassword) } returns newEncodedPassword
        every { passwordEncoder.encode(not(eq(newPassword))) } returns "hashedRefreshToken"
        every { userService.updateUser(capture(capturedUsers)) } answers { firstArg() }

        val response = authenticationService.changePassword(testUser, testPassword, newPassword)

        assertNotNull(response.accessToken)
        verify(exactly = 2) { userService.updateUser(any()) }

        val firstCallUser = capturedUsers[0]
        assertEquals(newEncodedPassword, firstCallUser.password)
        assertFalse(firstCallUser.isPasswordChangeRequired)

        val secondCallUser = capturedUsers[1]
        assertEquals("hashedRefreshToken", secondCallUser.refreshToken)
    }

    // --- Tests for Refresh Token Logic ---

    @Test
    fun `generateRefreshToken should update user with hashed token`() {
        val hashedToken = "hashedRefreshToken"
        val userSlot = slot<User>()
        every { passwordEncoder.encode(any<String>()) } returns hashedToken
        every { userService.updateUser(capture(userSlot)) } returns testUser

        val refreshToken = authenticationService.generateRefreshToken(testUser)

        assertNotNull(refreshToken)
        verify(exactly = 1) { userService.updateUser(any()) }
        assertEquals(hashedToken, userSlot.captured.refreshToken)
    }

    @Test
    fun `isRefreshTokenValid should return true for valid token`() {
        val storedHash = "theCorrectStoredHash"
        testUser.refreshToken = storedHash

        val tokenToValidate = authenticationService.generateAccessToken(testUser)!!

        every { passwordEncoder.matches(tokenToValidate, storedHash) } returns true

        val isValid = authenticationService.isRefreshTokenValid(tokenToValidate, testUser)

        assertTrue(isValid)
    }

    @Test
    fun `isRefreshTokenValid should return false when hash does not match`() {
        val storedHash = "differentHashedToken"
        testUser.refreshToken = storedHash

        val tokenToValidate = authenticationService.generateAccessToken(testUser)!!

        every { passwordEncoder.matches(tokenToValidate, storedHash) } returns false

        val isValid = authenticationService.isRefreshTokenValid(tokenToValidate, testUser)

        assertFalse(isValid)
    }
}
package org.catalyst.backend.services

import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.justRun
import io.mockk.verify
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.entities.user.UserRepository
import org.catalyst.backend.entities.user.role.Role
import org.catalyst.backend.entities.user.role.RoleRepository
import org.catalyst.backend.exceptions.FieldedResponseStatusException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockKExtension::class)
class UserServiceTest {

    // --- Mocks and Service Under Test ---

    @MockK
    private lateinit var userRepository: UserRepository

    @MockK
    private lateinit var roleRepository: RoleRepository

    @MockK
    private lateinit var passwordEncoder: PasswordEncoder

    @InjectMockKs
    private lateinit var userService: UserService

    // --- Tests for getUserById ---

    @Test
    fun `getUserById should return user when found`() {
        val userId = UUID.randomUUID()
        val mockUser = User("test", "pass", LocalDateTime.now(), id = userId)
        every { userRepository.findById(userId) } returns Optional.of(mockUser)

        val result = userService.getUserById(userId)

        assertEquals(userId, result.id)
    }

    @Test
    fun `getUserById should throw NotFound when user does not exist`() {
        val userId = UUID.randomUUID()
        every { userRepository.findById(userId) } returns Optional.empty()

        assertThrows<ResponseStatusException> {
            userService.getUserById(userId)
        }
    }


    // --- Tests for createUser ---

    @Test
    fun `createUser should save user with ROLE_USER when username is unique`() {
        val username = "newUser"
        val password = "password123"
        val encodedPassword = "encodedPassword"
        val userRole = Role("ROLE_USER", id = 1L)

        every { userRepository.findByUsername(username) } returns Optional.empty()
        every { roleRepository.findByName("ROLE_USER") } returns Optional.of(userRole)
        every { passwordEncoder.encode(password) } returns encodedPassword
        every { userRepository.save(any()) } answers { firstArg() }

        val result = userService.createUser(username, password)

        assertEquals(username, result.username)
        assertEquals(encodedPassword, result.password)
        assertTrue(result.roles.contains(userRole))
        assertTrue(result.isPasswordChangeRequired)

        verify {
            userRepository.save(withArg { savedUser ->
                assertEquals(username, savedUser.username)
                assertEquals(encodedPassword, savedUser.password)
                assertEquals(setOf(userRole), savedUser.roles)
            })
        }
    }

    @Test
    fun `createUser should throw Conflict when username already exists`() {
        val existingUser = User("existingUser", "pass", LocalDateTime.now())
        every { userRepository.findByUsername("existingUser") } returns Optional.of(existingUser)

        val exception = assertThrows<FieldedResponseStatusException> {
            userService.createUser("existingUser", "password")
        }
        assertEquals(HttpStatus.CONFLICT, exception.statusCode)
        verify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `createUser should throw IllegalStateException when ROLE_USER is not found`() {
        every { userRepository.findByUsername(any()) } returns Optional.empty()
        every { roleRepository.findByName("ROLE_USER") } returns Optional.empty()

        assertThrows<IllegalStateException> {
            userService.createUser("anyUser", "password")
        }
    }


    // --- Test for createAdmin ---

    @Test
    fun `createAdmin should save user with ROLE_USER and ROLE_ADMIN`() {
        val username = "newAdmin"
        val password = "adminPassword"
        val userRole = Role("ROLE_USER")
        val adminRole = Role("ROLE_ADMIN")

        every { roleRepository.findByName("ROLE_USER") } returns Optional.of(userRole)
        every { roleRepository.findByName("ROLE_ADMIN") } returns Optional.of(adminRole)
        every { passwordEncoder.encode(password) } returns "encodedAdminPassword"
        every { userRepository.save(any()) } answers { firstArg() }

        val result = userService.createAdmin(username, password)

        assertEquals(username, result.username)
        assertTrue(result.roles.containsAll(listOf(userRole, adminRole)))
        assertFalse(result.isPasswordChangeRequired)
    }


    // --- Tests for simple pass-through methods ---

    @Test
    fun `updateUser should call repository save`() {
        val userToUpdate = User("user", "pass", LocalDateTime.now())
        every { userRepository.save(userToUpdate) } returns userToUpdate

        userService.updateUser(userToUpdate)

        verify(exactly = 1) { userRepository.save(userToUpdate) }
    }

    @Test
    fun `deleteUserById should call repository deleteById`() {
        val userId = UUID.randomUUID()
        justRun { userRepository.deleteById(userId) }

        userService.deleteUserById(userId)

        verify(exactly = 1) { userRepository.deleteById(userId) }
    }


    // --- Test for UserDetailsService implementation ---

    @Test
    fun `loadUserByUsername should return user when found`() {
        val username = "testuser"
        val mockUser = User(username, "pass", LocalDateTime.now())
        every { userRepository.findByUsername(username) } returns Optional.of(mockUser)

        val userDetails = userService.loadUserByUsername(username)

        assertNotNull(userDetails)
        assertEquals(username, userDetails.username)
    }

    @Test
    fun `loadUserByUsername should throw NotFound when user does not exist`() {
        val username = "nonexistent"
        every { userRepository.findByUsername(username) } returns Optional.empty()

        val exception = assertThrows<ResponseStatusException> {
            userService.loadUserByUsername(username)
        }
        assertEquals(HttpStatus.NOT_FOUND, exception.statusCode)
    }
}
package org.catalyst.backend.services

import org.catalyst.backend.entities.user.User
import org.catalyst.backend.entities.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : UserDetailsService {
    fun findUserByUsername(username: String): Optional<User> {
        return userRepository.findByUsername(username)
    }

    fun createUser(
        username: String,
        password: String
    ): User {
        return userRepository.save(
            User(
                username,
                passwordEncoder.encode(password),
                LocalDateTime.now(ZoneOffset.UTC)
            )
        )
    }

    fun updateUser(user: User): User {
        return userRepository.save(user)
    }

    override fun loadUserByUsername(username: String): UserDetails {
        return userRepository
            .findByUsername(username)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
    }
}
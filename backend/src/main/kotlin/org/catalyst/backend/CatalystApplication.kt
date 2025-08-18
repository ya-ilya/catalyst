package org.catalyst.backend

import org.catalyst.backend.services.UserService
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.core.annotation.Order
import org.springframework.scheduling.annotation.EnableScheduling

@Order(2)
@EnableScheduling
@SpringBootApplication(scanBasePackages = ["org.catalyst.backend"])
class CatalystApplication(private val userService: UserService) : CommandLineRunner {
    @Value("\${catalyst.admin.username}")
    private val adminUsername: String? = null

    @Value("\${catalyst.admin.password}")
    private val adminPassword: String? = null

    override fun run(vararg args: String?) {
        if (userService.findUserByUsername(adminUsername!!).isEmpty) {
            userService.createAdmin(
                adminUsername,
                adminPassword!!
            )
        }
    }
}

fun main(args: Array<String>) {
    runApplication<CatalystApplication>(*args)
}

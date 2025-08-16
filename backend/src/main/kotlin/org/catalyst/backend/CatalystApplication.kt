package org.catalyst.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@EnableScheduling
@SpringBootApplication(scanBasePackages = ["org.catalyst.backend"])
class CatalystApplication

fun main(args: Array<String>) {
    runApplication<CatalystApplication>(*args)
}

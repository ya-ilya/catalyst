plugins {
    kotlin("jvm")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(24)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("jakarta.validation:jakarta.validation-api:3.0.2")
    api("com.fasterxml.jackson.module:jackson-module-kotlin:2.20.2")
}
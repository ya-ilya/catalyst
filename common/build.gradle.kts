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
}
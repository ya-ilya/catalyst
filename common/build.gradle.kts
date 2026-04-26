val catalystVersion: String by project

plugins {
    kotlin("jvm")
    `maven-publish`
}

group = "org.catalyst"
version = catalystVersion

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("jakarta.validation:jakarta.validation-api:3.0.2")
    api("com.fasterxml.jackson.module:jackson-module-kotlin:2.20.2")
}

publishing {
    publications {
        create<MavenPublication>("common") {
            artifactId = "common"

            from(components["java"])
        }
    }
}
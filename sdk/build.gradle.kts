val catalystVersion: String by project

plugins {
    kotlin("jvm")
    `maven-publish`
    `java-library`
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
    api("com.google.code.gson:gson:2.13.2")
    api("com.squareup.retrofit2:retrofit:3.0.0")
    api("com.squareup.retrofit2:converter-gson:3.0.0")
    api("com.squareup.okhttp3:okhttp:4.12.0")
    api(project(":common"))

	testImplementation("org.junit.jupiter:junit-jupiter-engine")
    testImplementation("com.squareup.retrofit2:retrofit-mock:3.0.0")
    testImplementation("io.mockk:mockk:1.14.9")
	testImplementation(kotlin("test-junit5"))
}

publishing {
    publications {
        create<MavenPublication>("sdk") {
            artifactId = "sdk"

            from(components["java"])
        }
    }
}
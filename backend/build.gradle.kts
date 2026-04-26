val catalystVersion: String by project

plugins {
	id("org.springframework.boot")
	id("io.spring.dependency-management")
	kotlin("plugin.jpa")
	kotlin("jvm")
	kotlin("plugin.spring")
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
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-websocket")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-cache")
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.2")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
	implementation("com.mysql:mysql-connector-j:9.6.0")
	implementation("com.bucket4j:bucket4j-core:8.10.1")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.bouncycastle:bcpkix-jdk18on:1.83")
	implementation("io.jsonwebtoken:jjwt:0.13.0")
	implementation(project(":common"))

	testImplementation("org.junit.jupiter:junit-jupiter-engine")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.testcontainers:junit-jupiter:1.21.4")
	testImplementation("org.testcontainers:mysql:1.21.4")
	testImplementation("io.mockk:mockk:1.14.9")
	testImplementation(kotlin("test-junit5"))
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

tasks.test {
	useJUnitPlatform()
}
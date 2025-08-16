plugins {
	id("org.springframework.boot")
	id("io.spring.dependency-management")
	kotlin("plugin.jpa")
	kotlin("jvm")
	kotlin("plugin.spring")
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
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-websocket")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.4.0")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
	implementation("com.mysql:mysql-connector-j:9.1.0")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.bouncycastle:bcpkix-jdk18on:1.81")
	implementation("io.jsonwebtoken:jjwt:0.12.5")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}
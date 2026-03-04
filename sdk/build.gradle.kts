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
    implementation("com.google.code.gson:gson:2.13.2")
    implementation("com.squareup.retrofit2:retrofit:3.0.0")
    implementation("com.squareup.retrofit2:converter-gson:3.0.0")
    implementation(project(":common"))

	testImplementation("org.junit.jupiter:junit-jupiter-engine")
    testImplementation("com.squareup.retrofit2:retrofit-mock:3.0.0")
    testImplementation("io.mockk:mockk:1.14.9")
	testImplementation(kotlin("test-junit5"))
}
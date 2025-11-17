# Catalyst

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge&)](https://www.gnu.org/licenses/gpl-3.0.en.html)
![Kotlin](https://img.shields.io/badge/Kotlin-0095D5?style=for-the-badge&logo=kotlin&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PrimeReact](https://img.shields.io/badge/PrimeReact-E67E22?style=for-the-badge&logo=primereact&logoColor=white)

## Project Overview

Catalyst is a comprehensive web application designed for managing Capes and Configurations, featuring a robust backend built with Kotlin and Spring Boot, a dynamic frontend developed using React and TypeScript, and a shared SDK for integration. The application provides functionalities for users to view, select, and subscribe to content, while administrators can manage and moderate Capes and Configurations.

## Features

* **User Management:** Secure authentication, user profile management, password changes.
* **Capes Management:** View, select, and unselect user capes. Admin functionalities for creating, deleting, and managing cape images.
* **Configurations Management:** Browse public configurations, subscribe/unsubscribe, filter, sort, and search. Admin/Author functionalities for creating, updating, and deleting configurations and their files.
* **API-Driven:** All interactions are handled via a RESTful API, with OpenAPI (Swagger) documentation available.
* **Modular Design:** Separated backend, frontend, common API contracts, and an SDK for external integration.

## Architecture

The project is structured into several key modules:

* **`backend`**: The server-side application built with Kotlin and Spring Boot. Handles API requests, business logic, and data persistence.
* **`frontend`**: The client-side web application built with React and TypeScript. Provides the user interface for interacting with the backend API.
* **`common`**: A shared Kotlin module containing common data transfer objects (DTOs), request/response models, and shared validation annotations used by both the backend and the SDK.
* **`sdk`**: A Kotlin SDK designed for easy integration with external applications (e.g., Minecraft mods) to consume the Catalyst API.

## Licensing

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.
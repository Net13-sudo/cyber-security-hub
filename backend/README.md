# Scorpion Security Hub – Backend

Spring Boot REST API for the Scorpion Security Hub.

## Requirements

- **Java 17+**
- **Maven 3.6+**

## Run locally

```bash
cd backend
mvn spring-boot:run
```

Server runs at **http://localhost:8080**.

## API overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health and version |
| `/api/threat-intelligence/feeds` | GET | List threat feed items (optional `?limit=50`) |
| `/api/threat-intelligence/feeds/{id}` | GET | Get one threat feed by ID |
| `/api/incidents` | GET | List incidents (optional `?status=OPEN&limit=100`) |
| `/api/incidents/{id}` | GET | Get one incident by ID |
| `/api/incidents` | POST | Create incident (JSON body) |
| `/api/incidents/{id}/status?status=CLOSED` | PATCH | Update incident status |

## H2 console

When the app is running, open **http://localhost:8080/h2-console** to inspect the in-memory database (JDBC URL: `jdbc:h2:mem:scorpion`, user: `sa`, password: empty).

## Configuration

- **Port:** `server.port=8080` in `src/main/resources/application.properties`
- **Database:** H2 in-memory by default. For production, switch to PostgreSQL or MySQL and set `spring.datasource.*` and JPA properties accordingly.
- **CORS:** Allowed origins for `/api/**` are set in `WebConfig` (e.g. `http://localhost:3000`, `http://127.0.0.1:5500`). Add your frontend origin there if needed.

## Build

```bash
mvn clean package
java -jar target/scorpion-security-hub-backend-1.0.0.jar
```

## Project layout

```
backend/
├── pom.xml
├── src/main/java/com/scorpion/security/
│   ├── ScorpionSecurityHubApplication.java
│   ├── config/          # WebConfig (CORS), DataInitializer
│   ├── controller/      # REST controllers
│   ├── dto/             # Request/response DTOs
│   ├── entity/          # JPA entities
│   ├── repository/      # JPA repositories
│   └── service/         # Business logic
└── src/main/resources/
    └── application.properties
```

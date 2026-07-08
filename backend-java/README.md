# TrafficGuard AI - Java Spring Boot Backend

This is the official production-ready Java backend source code for the **TrafficGuard AI – Smart Traffic Violation Detection and Management System**.

## Technology Stack
- **Framework**: Spring Boot v3.2.4 (Java 17)
- **ORM**: Spring Data JPA + Hibernate
- **Database**: MySQL v8.0
- **Database Management Tool**: MySQL Workbench / CLI
- **Build Tool**: Maven

---

## Folder Structure
```text
/backend-java
├── pom.xml                                  # Maven dependencies and build tasks
└── src
    └── main
        ├── java
        │   └── com
        │       └── trafficguard
        │           ├── TrafficGuardApplication.java # Spring Boot entry point
        │           ├── controller           # REST API endpoints
        │           │   ├── AuthController.java
        │           │   ├── HotspotController.java
        │           │   ├── OwnerController.java
        │           │   ├── ReportController.java
        │           │   └── ViolationController.java
        │           ├── entity               # JPA Database entities
        │           │   ├── Hotspot.java
        │           │   ├── User.java
        │           │   ├── VehicleOwner.java
        │           │   └── Violation.java
        │           ├── exception            # Custom exception layer
        │           │   └── GlobalExceptionHandler.java
        │           └── repository           # Hibernate JPA data-repositories
        │               ├── HotspotRepository.java
        │               ├── UserRepository.java
        │               ├── VehicleOwnerRepository.java
        │               └── ViolationRepository.java
        └── resources
            ├── application.properties       # DB connection & server port mappings
            ├── schema.sql                   # MySQL schema table creation scripts
            └── data.sql                     # Seed script with AP regional traffic logs
```

---

## 🛠️ Local Setup and Installation Instructions

### Prerequisite Checklist
1. **Java Development Kit (JDK 17)** installed.
2. **Apache Maven** installed (or use the included `./mvnw` wrapper).
3. **MySQL Server** installed and running on default port `3306`.
4. **MySQL Workbench** or any DB administrator client.
5. **VS Code** with the *Extension Pack for Java* and *Spring Boot Extension Pack* (or **IntelliJ IDEA**).

---

### Step 1: Configure MySQL Database with MySQL Workbench
1. Launch **MySQL Workbench** and establish a connection to your local MySQL instance.
2. Create a new database schema named `trafficguard_db`:
   ```sql
   CREATE DATABASE trafficguard_db;
   ```
3. Open a SQL query tab, copy the contents of `src/main/resources/schema.sql` into the editor, and click **Execute (⚡)** to instantiate all tables (`users`, `violations`, `vehicle_owners`, `reports`, `hotspots`).
4. Copy the contents of `src/main/resources/data.sql` and execute it to populate sample Andhra Pradesh traffic logs and officers database.

---

### Step 2: Configure Spring Boot Connection
Open `src/main/resources/application.properties` and verify your MySQL root username and password:
```properties
spring.datasource.username=root
spring.datasource.password=root123   # Change to your actual MySQL root password
```

---

### Step 3: Run the Application in VS Code or IntelliJ IDEA
#### Options A: Using VS Code
1. Open the `/backend-java` folder in VS Code.
2. Navigate to `src/main/java/com/trafficguard/TrafficGuardApplication.java`.
3. Press **F5** or click the **Run** button hovering above the `main` method.

#### Options B: Command Line (Maven CLI)
Open a terminal in the `/backend-java` root folder and execute:
```bash
# Compile and build the jar
mvn clean package -DskipTests

# Run the Spring Boot app
mvn spring-boot:run
```

The Spring Boot backend will bind to port `8080`.

---

## 📡 REST API Reference

| Endpoint | Method | Access Level | Description |
| :--- | :---: | :--- | :--- |
| `/api/login` | `POST` | Public | Authenticate officer/admin credentials |
| `/api/signup` | `POST` | Admin | Register new traffic officers |
| `/api/violations` | `GET` | Admin / Officer | Get all violations (or only officer registered ones) |
| `/api/violations` | `POST` | Officer | Report a new traffic violation |
| `/api/violations/{id}`| `GET` | All | Fetch specific violation details |
| `/api/violations/{id}`| `PUT` | Officer | Update fine status or description |
| `/api/violations/{id}`| `DELETE`| Admin | Remove a false violation report |
| `/api/owners/{vehicleNumber}`| `GET`| All | Look up owner records and vehicle history |
| `/api/reports/weekly`| `GET`| Admin / Officer | Fetch last 7 days metrics |
| `/api/reports/monthly`| `GET`| Admin / Officer | Fetch current year monthly metrics |
| `/api/hotspots` | `GET` | All | Fetch regional high-risk intersections in AP |

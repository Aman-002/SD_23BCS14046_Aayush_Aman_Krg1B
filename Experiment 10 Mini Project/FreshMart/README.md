# 🥬 FarmFresh — Online Grocery Platform

A full-stack **microservices-based** online grocery shopping system built with **Spring Boot**, **Spring Cloud**, and **Angular 17**. The backend follows a service-oriented architecture with Netflix Eureka for service discovery, Spring Cloud Gateway for API routing, and PostgreSQL for persistence.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Services](#services)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Default Credentials](#default-credentials)
- [Frontend Pages](#frontend-pages)
- [Configuration Reference](#configuration-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

```
┌────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│                │        │                      │        │                 │
│  Angular 17    │───────▶│   API Gateway        │───────▶│  Core Service   │
│  (Port 4200)   │        │   (Port 8080)        │        │  (Port 8081)    │
│                │        │                      │        │                 │
└────────────────┘        │  Spring Cloud        │        │  Auth, Products │
                          │  Gateway + CORS      │        │  Wishlist, etc. │
                          │                      │        └─────────────────┘
                          │                      │
                          │                      │        ┌─────────────────┐
                          │                      │───────▶│                 │
                          │                      │        │  Order Service  │
                          └──────────┬───────────┘        │  (Port 8082)    │
                                     │                    │                 │
                                     │                    │  Cart, Orders,  │
                          ┌──────────▼───────────┐        │  Payment        │
                          │                      │        └─────────────────┘
                          │  Eureka Server       │
                          │  (Port 8761)         │
                          │                      │               │
                          │  Service Discovery   │               ▼
                          └──────────────────────┘        ┌─────────────────┐
                                                          │  PostgreSQL     │
                                                          │  grocery_db     │
                                                          └─────────────────┘
                                                          
```
![Architecture](architecture.png)

All backend services register with the **Eureka Server**. The **API Gateway** uses `lb://` (load-balanced) URIs to route requests to the appropriate downstream service.

---

## Tech Stack

| Layer              | Technology                                             |
| ------------------ | ------------------------------------------------------ |
| **Frontend**       | Angular 17 (standalone components), TypeScript, RxJS   |
| **API Gateway**    | Spring Cloud Gateway (WebFlux / reactive)              |
| **Backend**        | Spring Boot 3.2.3, Spring Data JPA, Lombok             |
| **Service Disc.**  | Netflix Eureka Server & Client                         |
| **Database**       | PostgreSQL                                             |
| **Email**          | SendGrid Java SDK 4.9.3                                |
| **CSV Import**     | OpenCSV 5.9                                            |
| **Build Tool**     | Maven (backend), Angular CLI (frontend)                |
| **Java Version**   | 17                                                     |

---

## Services

### Eureka Server (`eureka-server`)
Service registry for all microservices. Dashboard available at `http://localhost:8761`.

### API Gateway (`api-gateway`)
Single entry point for the frontend. Routes requests based on path predicates:

| Route              | Target Service | Path Pattern        |
| ------------------ | -------------- | ------------------- |
| Authentication     | core-service   | `/api/auth/**`      |
| Products           | core-service   | `/api/products/**`  |
| Wishlist           | core-service   | `/api/wishlist/**`  |
| Feedback           | core-service   | `/api/feedback/**`  |
| Coupons            | core-service   | `/api/coupons/**`   |
| Cart               | order-service  | `/api/cart/**`       |
| Orders             | order-service  | `/api/orders/**`    |
| Payment            | order-service  | `/api/payment/**`   |

### Core Service (`core-service`)
Handles user authentication, product catalog, wishlists, customer feedback, and coupon management.

**Controllers:** `AuthController` · `ProductController` · `WishlistController` · `FeedbackController` · `CouponController`

**Models:** `Login` · `Customer` · `Product` · `Wishlist` · `Feedback` · `Coupon`

### Order Service (`order-service`)
Handles shopping cart operations, order placement/cancellation, and payment processing.

**Controllers:** `CartController` · `OrderController` · `PaymentController`

**Models:** `CartItem` · `Order` · `OrderItem` · `Product` · `Coupon` · `Customer` · `Login`

---

## Project Structure

```
grocery-microservices-clean/
├── api-gateway/                 # Spring Cloud Gateway
│   └── src/main/
│       ├── java/.../gateway/
│       │   └── ApiGatewayApplication.java
│       └── resources/
│           └── application.yml  # Route definitions & CORS
│
├── eureka-server/               # Netflix Eureka Server
│   └── src/main/
│       ├── java/.../eureka/
│       └── resources/
│           └── application.properties
│
├── core-service/                # Auth, Products, Wishlist, Feedback, Coupons
│   └── src/main/
│       ├── java/.../core/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── model/
│       │   ├── repository/
│       │   └── service/
│       └── resources/
│           └── application.properties
│
├── order-service/               # Cart, Orders, Payment
│   └── src/main/
│       ├── java/.../order/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── model/
│       │   ├── repository/
│       │   └── service/
│       └── resources/
│           └── application.properties
│
├── frontend/                    # Angular 17 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Standalone components
│   │   │   ├── guards/          # Auth & Admin route guards
│   │   │   ├── services/        # HTTP API services
│   │   │   ├── app.routes.ts
│   │   │   └── app.component.ts
│   │   ├── assets/
│   │   └── styles.css
│   ├── angular.json
│   └── package.json
│
├── database/
│   ├── schema.sql               # Full schema + seed data
│   ├── migration_add_payment.sql # Incremental migration
│   └── sample_products.csv
│
└── README.md
```

---

## Prerequisites

| Tool         | Version           | Notes                         |
| ------------ | ----------------- | ----------------------------- |
| **Java**     | 17+               | OpenJDK or Oracle JDK         |
| **Maven**    | 3.8+              | Wrapper not included          |
| **Node.js**  | 18+               | For the Angular frontend      |
| **npm**      | 9+                | Ships with Node.js            |
| **PostgreSQL** | 14+             | Must be running on port 5432  |

---

## Database Setup

1. **Create the database and tables** using the provided schema:

   ```bash
   psql -U postgres -f database/schema.sql
   ```

   > **Note:** The schema file uses MySQL-style syntax (`CREATE DATABASE`, `USE`, `ENUM`). If running on PostgreSQL, you may need to create the database manually and adapt enum/type syntax, or rely on JPA's `ddl-auto=update` to generate tables on first boot.

2. **(Optional) Run migrations** if you're upgrading an existing deployment:

   ```bash
   psql -U postgres -d grocery_db -f database/migration_add_payment.sql
   ```

3. **Default database configuration:**

   | Property   | Value                                         |
   | ---------- | --------------------------------------------- |
   | Host       | `localhost`                                   |
   | Port       | `5432`                                        |
   | Database   | `grocery_db`                                  |
   | Username   | `postgres`                                    |
   | Password   | `12345`                                       |

   Update credentials in `core-service/src/main/resources/application.properties` and `order-service/src/main/resources/application.properties` if your setup differs.

---

## Running the Application

Start services **in this order** — each service depends on the one before it.

### 1. Eureka Server

```bash
cd eureka-server
mvn spring-boot:run
```

Verify at [http://localhost:8761](http://localhost:8761) — the dashboard should load.

### 2. Core Service

```bash
cd core-service
mvn spring-boot:run
```

Registers with Eureka on port **8081**.

### 3. Order Service

```bash
cd order-service
mvn spring-boot:run
```

Registers with Eureka on port **8082**.

### 4. API Gateway

```bash
cd api-gateway
mvn spring-boot:run
```

Starts on port **8080** and discovers downstream services via Eureka.

### 5. Frontend

```bash
cd frontend
npm install
ng serve
```

Opens at [http://localhost:4200](http://localhost:4200).

---

## API Reference

All endpoints are accessed through the API Gateway at `http://localhost:8080/api`.

### Authentication

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| POST   | `/api/auth/register`           | Register a new customer     |
| POST   | `/api/auth/login`              | Customer login              |
| POST   | `/api/auth/admin-login`        | Admin login                 |
| POST   | `/api/auth/forgot-password`    | Password recovery via email |

### Products

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/products`                | List all products (optional `?name=` filter) |
| GET    | `/api/products/{id}`           | Get product by ID           |
| POST   | `/api/products`                | Add a new product (Admin)   |
| PUT    | `/api/products/{id}`           | Update a product (Admin)    |
| DELETE | `/api/products/{id}`           | Delete a product (Admin)    |
| POST   | `/api/products/bulk-upload`    | Bulk import products via CSV (Admin) |

### Cart

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/cart/{customerId}`       | Get customer's cart         |
| POST   | `/api/cart/add`                | Add item to cart            |
| PUT    | `/api/cart/update/{cartItemId}` | Update item quantity        |
| DELETE | `/api/cart/remove/{cartItemId}` | Remove item from cart       |

### Orders

| Method | Endpoint                            | Description                      |
| ------ | ----------------------------------- | -------------------------------- |
| POST   | `/api/orders/place/{customerId}`    | Place order from cart            |
| GET    | `/api/orders/history/{customerId}`  | Get customer order history       |
| GET    | `/api/orders/all`                   | Get all orders (Admin)           |
| PUT    | `/api/orders/cancel/{orderId}`      | Cancel an order (`?customerId=`) |

### Wishlist

| Method | Endpoint                                    | Description            |
| ------ | ------------------------------------------- | ---------------------- |
| GET    | `/api/wishlist/{customerId}`                | Get customer wishlist  |
| POST   | `/api/wishlist/toggle?customerId=&productId=` | Toggle wishlist item   |

### Feedback

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/feedback`        | Submit feedback          |
| GET    | `/api/feedback/all`    | Get all feedback (Admin) |

### Coupons

| Method | Endpoint                            | Description                         |
| ------ | ----------------------------------- | ----------------------------------- |
| POST   | `/api/coupons/validate?code=&total=` | Validate and apply a coupon         |
| GET    | `/api/coupons/all`                  | List all coupons (Admin)            |
| POST   | `/api/coupons`                      | Create a coupon (Admin)             |
| PUT    | `/api/coupons/toggle/{id}`          | Toggle coupon active status (Admin) |
| DELETE | `/api/coupons/{id}`                 | Delete a coupon (Admin)             |

### Payment

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | `/api/payment/**`    | Process payment      |

---

## Default Credentials

| Role     | Email                | Password     |
| -------- | -------------------- | ------------ |
| **Admin** | `admin@grocery.com` | `Admin@123`  |

---

## Frontend Pages

### Customer

| Route           | Page                       |
| --------------- | -------------------------- |
| `/`             | Landing page               |
| `/login`        | Customer login             |
| `/register`     | Customer registration      |
| `/forgot-password` | Password recovery       |
| `/home`         | Home / Dashboard           |
| `/products`     | Browse products            |
| `/cart`         | Shopping cart              |
| `/wishlist`     | Saved items                |
| `/payment`      | Checkout & payment         |
| `/orders`       | Order history              |
| `/profile`      | Customer profile           |

### Admin

| Route              | Page                    |
| ------------------ | ----------------------- |
| `/admin-login`     | Admin login             |
| `/admin`           | Admin dashboard         |
| `/admin/products`  | Manage product catalog  |
| `/admin/customers` | Manage customers        |
| `/admin/orders`    | Manage orders           |
| `/admin/coupons`   | Manage coupons          |
| `/admin/feedback`  | View customer feedback  |

---

## Configuration Reference

### Port Mapping

| Service        | Port  |
| -------------- | ----- |
| Eureka Server  | 8761  |
| API Gateway    | 8080  |
| Core Service   | 8081  |
| Order Service  | 8082  |
| Angular Dev    | 4200  |
| PostgreSQL     | 5432  |

### Environment Variables / Properties

The following properties can be configured in each service's `application.properties` (or `application.yml` for the gateway):

| Property                         | Service       | Description                    |
| -------------------------------- | ------------- | ------------------------------ |
| `spring.datasource.url`         | core, order   | JDBC URL for PostgreSQL        |
| `spring.datasource.username`    | core, order   | Database username              |
| `spring.datasource.password`    | core, order   | Database password              |
| `sendgrid.api.key`              | core, order   | SendGrid API key for emails    |
| `sendgrid.from.email`           | core, order   | Sender email address           |
| `eureka.client.service-url.defaultZone` | all   | Eureka server URL              |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is for educational purposes.

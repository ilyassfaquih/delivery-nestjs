# 🍔 Food Delivery & Reservation API (NestJS)

This is the **NestJS** version of the Spring Boot Food Delivery API. It was recreated to learn NestJS concepts by mapping Spring Boot patterns to NestJS equivalents.

## 🚀 Technologies Used

* **Node.js + TypeScript**
* **NestJS** (Controllers, Services, Modules, Pipes, Filters)
* **TypeORM** (ORM, equivalent to JPA/Hibernate)
* **PostgreSQL** (Database)
* **class-validator** (Validation, equivalent to Jakarta Validation)
* **Docker & Docker Compose** (Containerization)

---

## 🛠️ Spring Boot → NestJS Mapping

| Spring Boot | NestJS |
|---|---|
| `@Entity` (JPA) | `@Entity()` (TypeORM) |
| `@Repository` (JpaRepository) | `Repository<Entity>` (TypeORM) |
| `@Service` | `@Injectable()` |
| `@RestController` + `@RequestMapping` | `@Controller()` + `@Get()/@Post()` |
| `@Valid` + Jakarta Validation | `ValidationPipe` + `class-validator` |
| `@ControllerAdvice` | `@Catch()` Exception Filter |
| MapStruct | Manual mapping (TypeScript) |
| `application.properties` | `TypeOrmModule.forRoot()` |
| Liquibase | TypeORM `synchronize: true` |
| Lombok | Not needed (TypeScript) |

---

## ⚙️ Prerequisites

* Node.js 20+
* Docker & Docker Compose
* npm

---

## 🏃‍♂️ How to Run

### 1. Database Setup (using Docker)
```bash
docker-compose up -d postgres
```

### 2. Start the Application
```bash
npm install
npm run start:dev
```

The API will be running on **http://localhost:3000**.

---

## 🔌 API Endpoints

### 1. 👤 Customers (`/api/customers`)

**Register a new customer:**
```
POST /api/customers
```
```json
{
  "firstName": "Ilyas",
  "lastName": "Faquih",
  "email": "ilyas@example.com",
  "phone": "+212 600 000 000"
}
```

### 2. 🍕 Menu (`/api/menu`)

**Add a Menu Item:**
```
POST /api/menu
```
```json
{
  "name": "Pizza Royale",
  "price": 85.00,
  "available": true
}
```

**Get Menu Items:**
```
GET /api/menu          (Get all)
GET /api/menu?q=pizza  (Search by name)
```

### 3. 📦 Orders (`/api/orders`)

**Create an Order:**
```
POST /api/orders
```
```json
{
  "customerCode": "uuid-here",
  "deliveryTime": "13:30",
  "deliveryMode": "DELIVERY",
  "menuItemIds": [1, 2]
}
```

**Validation Rules:**
- `customerCode`: Must exist in the database
- `deliveryTime`: Must be between 08:00 and 00:00 (midnight)
- `menuItemIds`: Cannot be empty

---

## 🗄️ Database Schema

Managed via TypeORM (auto-sync in dev):

- **customer**: Stores customer details and unique UUID codes
- **menu_item**: Stores available food items
- **food_order**: Stores order details (time, delivery mode)
- **order_items**: Join table for Orders ↔ Menu Items (Many-to-Many)

---

## 🛡️ Error Handling

Structured error responses:

**Validation Error (400):**
```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Validation Failed",
  "code": "INVALID_JSON",
  "message": "One or more fields failed validation",
  "fieldErrors": ["First name is required"]
}
```

**Business Error (404):**
```json
{
  "timestamp": "...",
  "status": 404,
  "error": "Business Error",
  "code": "CUSTOMER_NOT_FOUND",
  "message": "No customer found with code: ..."
}
```

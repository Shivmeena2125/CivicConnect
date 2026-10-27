# CivicConnect — Future Backend API Contract & Database Schema (Phase 2)

> ⚠️ **Important Notice for Presentation & Reviewers:**
> The endpoints and schemas documented in this file are the **Phase 2 planned architecture**.
> In the current **Phase 1 prototype**, all operations are fulfilled on the client-side via `complaintService.js` and persisted via browser `localStorage`.
> This document proves architectural foresight for college viva and future expansion into Java Spring Boot and MySQL.

---

## 1. Planned REST API Endpoints

### 1.1 Create a Complaint
- **Endpoint:** `POST /api/v1/complaints`
- **Access:** Citizen (Authenticated via JWT or Guest token)
- **Content-Type:** `multipart/form-data`
- **Request Parameters:**
  - `title` (string, required, length: 5–100)
  - `category` (string, required: `Road Damage` | `Garbage` | `Streetlight` | `Water Leakage` | `Other`)
  - `location` (string, required, length: 5–150)
  - `description` (string, required, length: 10–1000)
  - `photo` (file, optional, max 5MB, format: JPG/PNG/WebP)

#### Response: `201 Created`
```json
{
  "success": true,
  "message": "Complaint successfully registered",
  "data": {
    "id": "CC-2026-8942",
    "title": "Broken water pipeline on main road",
    "category": "Water Leakage",
    "location": "Near City Hospital Gate 2, MG Road",
    "description": "Continuous leakage wasting drinking water and flooding street.",
    "status": "Pending",
    "photoUrl": "https://storage.civicconnect.gov/uploads/2026/10/CC-2026-8942.jpg",
    "citizenId": "USR-1082",
    "createdAt": "2026-10-27T10:30:00.000Z",
    "updatedAt": "2026-10-27T10:30:00.000Z"
  }
}
```

---

### 1.2 Get All Complaints (With Filter & Pagination)
- **Endpoint:** `GET /api/v1/complaints`
- **Access:** Public / Citizen / Staff / Admin
- **Query Parameters:**
  - `page` (integer, default: 0)
  - `size` (integer, default: 10)
  - `search` (string, optional: search text for ID, title, location)
  - `category` (string, optional: filter by category)
  - `status` (string, optional: `Pending`, `In Progress`, `Resolved`)
  - `sort` (string, default: `createdAt,desc`)

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "CC-2026-8942",
        "title": "Broken water pipeline on main road",
        "category": "Water Leakage",
        "location": "Near City Hospital Gate 2, MG Road",
        "description": "Continuous leakage wasting drinking water...",
        "status": "Pending",
        "photoUrl": "https://storage.civicconnect.gov/uploads/2026/10/CC-2026-8942.jpg",
        "createdAt": "2026-10-27T10:30:00.000Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 25,
    "totalPages": 3,
    "last": false
  }
}
```

---

### 1.3 Get Complaint by ID
- **Endpoint:** `GET /api/v1/complaints/{id}`
- **Access:** Public / Citizen
- **Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "id": "CC-2026-1001",
    "title": "Deep Pothole near City Hospital Gate 2",
    "category": "Road Damage",
    "location": "MG Road, Near City Civil Hospital",
    "description": "A deep pothole has formed in the middle of the road...",
    "status": "Pending",
    "photoUrl": "https://storage.civicconnect.gov/uploads/sample-road.jpg",
    "assignedDepartment": "Public Works Department (PWD)",
    "createdAt": "2026-10-24T09:30:00.000Z",
    "updatedAt": "2026-10-24T09:30:00.000Z"
  }
}
```

---

### 1.4 Update Complaint Status (Department Staff & Admin)
- **Endpoint:** `PATCH /api/v1/complaints/{id}/status`
- **Access:** Department Staff or Admin (Requires Role `ROLE_STAFF` or `ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
```json
{
  "status": "In Progress",
  "remarks": "Inspection team dispatched to MG Road site with repair crew.",
  "departmentId": 2
}
```
- **Response: `200 OK`**
```json
{
  "success": true,
  "message": "Complaint status updated successfully",
  "currentStatus": "In Progress"
}
```

---

### 1.5 Get Dashboard Aggregated Statistics
- **Endpoint:** `GET /api/v1/complaints/stats`
- **Access:** Public / Citizen
- **Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "pending": 18,
    "inProgress": 12,
    "resolved": 15
  }
}
```

---

## 2. Planned MySQL Relational Database Schema

```sql
-- Database creation
CREATE DATABASE IF NOT EXISTS civic_connect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE civic_connect_db;

-- 1. Users Table (Citizens, Staff, Admins)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone_number VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ROLE_CITIZEN', 'ROLE_STAFF', 'ROLE_ADMIN') NOT NULL DEFAULT 'ROLE_CITIZEN',
    department_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    head_officer_name VARCHAR(100),
    contact_email VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Complaints Table
CREATE TABLE complaints (
    id VARCHAR(20) PRIMARY KEY, -- e.g. CC-2026-1001
    citizen_id BIGINT NULL,
    title VARCHAR(100) NOT NULL,
    category ENUM('Road Damage', 'Garbage', 'Streetlight', 'Water Leakage', 'Other') NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
    photo_url VARCHAR(500) NULL,
    assigned_department_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 4. Status History & Audit Trail Table
CREATE TABLE complaint_status_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    previous_status ENUM('Pending', 'In Progress', 'Resolved') NOT NULL,
    new_status ENUM('Pending', 'In Progress', 'Resolved') NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);
```

---

## 3. Image Storage Strategy (Best Practice vs Anti-Pattern)

### ❌ Anti-Pattern: Storing BLOBs directly in MySQL
Storing binary image bytes directly inside a MySQL `BLOB` column degrades database performance, drastically increases database backup size, blocks query caching, and overwhelms database connection pools.

### ✅ Best Practice: File System / Object Storage (AWS S3 or Local Upload Directory)
1. The client uploads the image file via `multipart/form-data`.
2. Spring Boot Controller receives `MultipartFile photo`.
3. Spring Boot service streams the image bytes to Amazon S3 (or a local server folder `/var/civicconnect/uploads/`).
4. S3 returns a unique public URL (or local file URI).
5. Only the **URL string** (e.g. `https://s3.amazonaws.com/.../CC-2026-1001.jpg`) is saved in MySQL's `photo_url` column.
6. The frontend fetches and displays the image directly from that URL.

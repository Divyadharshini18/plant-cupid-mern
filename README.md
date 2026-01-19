# 🌱 Plant Cupid

Plant Cupid is a **full-stack MERN application** that helps users manage, track, and care for their plants. The core idea is simple: **global plant knowledge + user-owned plant instances**, combined with reminders and personalization.

This README is a **complete, single-file source of truth** for the entire project. Nothing is left out.

---

## Tech Stack

* **Frontend:** React, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Auth:** JWT-based authentication

---

## Core Concept (IMPORTANT)

Plant Cupid separates **plant knowledge** from **user ownership**.

* **Plant** → What a plant *is* (Aloe Vera, Rose, etc.)
* **UserPlant** → A *specific plant owned by a user*

This design avoids data duplication and allows multiple users to own the same type of plant.

---

## 🗂️ Data Models

### Plant (Master Data)

Represents a **type of plant** available in the system.
This data is **global and shared** across all users.

```json
{
  "name": "Aloe Vera",
  "waterFrequency": 21,
  "sunlight": "Bright indirect light",
  "temperature": "13–27°C",
  "tips": ["Avoid overwatering", "Use well-draining soil"]
}
```

**Notes:**

* Created by admin or seeded
* Not owned by any user
* Referenced by UserPlant

---

### UserPlant (User Instance)

Represents a **real plant owned by a specific user**.
Each UserPlant points to **one Plant**.

```json
{
  "user": "ObjectId",
  "plant": "ObjectId",
  "nickname": "Balcony Aloe",
  "location": "Balcony",
  "lastWatered": "2026-01-10"
}
```

**Why this exists:**

* One user can own multiple plants
* Multiple users can own the same plant type
* Each plant can have a custom name & state

---

## Identity Rule (CRITICAL)

* **Plant** → identified by `_id`
* **UserPlant** → identified by `_id`
* `nickname` is **NOT unique** and is only for display

---

## 👤 User Model

```json
{
  "name": "Divya",
  "email": "divya@email.com",
  "password": "hashed",
  "createdAt": "Date"
}
```

---

## Relationships

* **User → UserPlant** : One-to-Many
* **Plant → UserPlant** : One-to-Many

```text
User ─── owns ───> UserPlant ─── references ───> Plant
```

---

## API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Plants (Global)

* `GET /api/plants`
* `POST /api/plants` (admin)

### User Plants

* `POST /api/user-plants`
* `GET /api/user-plants`
* `PUT /api/user-plants/:id`
* `DELETE /api/user-plants/:id`

---

## Frontend Pages

* Login / Register
* Dashboard (My Plants)
* Add Plant
* Plant Details
* Care Reminders

---

## Future Enhancements

* Watering reminders
* Calendar view
* Weather-based suggestions
* Plant image uploads
* Push notifications

---

## Setup Instructions

```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm start
```
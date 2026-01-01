# Plant Cupid (MERN)

Plant Cupid is a full-stack plant care management application that helps users
track their plants, get watering reminders, and maintain healthy plant habits.

This project is built with scalability and real-world backend architecture in mind,
focusing on clean data modeling, authentication, and domain logic.

---

## Features

### Core Features
- User authentication with JWT
- Add plants to personal collection
- Nickname and manage user plants
- Water plants with spam-prevention logic
- Automatic watering reminders based on plant frequency
- Secure ownership checks for all actions

### Technical Highlights
- Separation of concerns (routes, controllers, models)
- MongoDB relational modeling using UserPlant abstraction
- Derived reminder logic (no redundant data storage)
- Duplicate prevention using compound indexes

---

## Tech Stack

**Frontend:** React (planned)  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Mongoose)  
**Auth:** JWT  
**Tools:** Postman, MongoDB Compass

---

## Folder Structure

```bash
backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── server.js

# Fun Friday Group Chat Server

A real-time group chat server built with **Node.js**, **Express**, **MySQL**, and **Socket.io**.  
It supports anonymous chat, message delivery ticks, role-based access, and a React-friendly frontend API.

---

## ✨ Features

- 💬 Real-time group chat
- 🕵️ Anonymous mode for users
- ✅ Message status indicators (single/double ticks)
- 🗄️ MySQL database integration
- 👥 Role-based user management (Admin, HR, Employee, Candidate)
- 📱 Mobile-friendly chat UI compatible with React frontend

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v18 or higher  
- **MySQL** server  
- **npm** (comes with Node.js)  

### Environment Variables

Create a `.env` file inside the `server/` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=chatdb
PORT=3123
```

### Installtion
```bash
cd server
npm install
```

### Run the server
```bash
npm start
```

### Run react app
```bash
npm install
npm run dev
```

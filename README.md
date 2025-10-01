# 🛡️ Insurance Management System

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-blue?logo=express)
![Angular](https://img.shields.io/badge/Angular-20-red?logo=angular)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-lightgrey)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen)

A comprehensive insurance management system built with **Node.js/Express backend** and **Angular frontend**, featuring **GraphQL API**, **JWT authentication**, and **role-based access control**.

---

## 🏗️ Architecture
- **Backend:** Node.js, Express, GraphQL (Apollo Server), MongoDB (Mongoose)  
- **Frontend:** Angular 20, TypeScript, Tailwind CSS  
- **Authentication:** JWT tokens with role-based access control  
- **Database:** MongoDB with Mongoose ODM  

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)  
- MongoDB (local or cloud instance)  
- npm or yarn  

### 1. Clone and Setup
```bash
git clone 
cd Insurance_Management
````
2. Backend Setup
```bash
cd backend
npm install
````
3. Frontend Setup
```bash
cd ../frontend
npm install
````
4. Run the Application

Backend (Terminal 1)
```bash
cd backend
npm run dev
````
Frontend (Terminal 2)
```bash
cd frontend
npm start
````

✅ The application will be available at:

Frontend → http://localhost:4200
Backend API → http://localhost:5000

📊 Features

User Management
Registration & authentication
Role-based access (Customer, Agent, Admin)
JWT token-based security
Policy Management
Create, read, update, delete insurance policies
Policy types and coverage management
Customer-policy relationships
Claims Processing
Submit and track claims
Status: submitted, under_review, approved, rejected
Agent/Admin claim processing
Payment Management
Track payments & status updates
Multiple payment methods
Due date & payment history
Admin Dashboard
System overview & analytics
User management
Policy & claim oversight

👥 User Roles

Customer: View own policies, claims, payments
Agent: Manage policies, process claims
Admin: Full system access & user management

🗄️ Database Schema

Users:
name, email, passwordHash, role, timestamps

Policies:
policyNumber, type, premium, coverage, status, startDate, endDate, customer

Claims:
claimNumber, policy, amount, status, description, submittedDate, processedDate

Payments:
policy, amount, dueDate, paidDate, status, paymentMethod, reference

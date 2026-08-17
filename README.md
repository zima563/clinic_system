# 🏥 SurgiClinic — Enterprise Medical & Clinic Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_18_%7C_Vite-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_%7C_Express-339933?logo=node.js)
![Prisma](https://img.shields.io/badge/ORM-Prisma_5-2D3748?logo=prisma)
![MySQL](https://img.shields.io/badge/Database-MySQL_8.0-4479A1?logo=mysql)
![Docker](https://img.shields.io/badge/DevOps-Docker_%7C_Docker_Compose-2496ED?logo=docker)
![Nginx](https://img.shields.io/badge/Reverse_Proxy-Nginx-009639?logo=nginx)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions)

SurgiClinic is an enterprise-grade, full-stack medical practice and clinic management platform engineered for medical centers, hospitals, and specialized clinics. It streamlines patient intake, doctor scheduling, consultation visits, financial invoicing, and security via a granular Role-Based Access Control (RBAC) system.

---

## 🌟 Key Features Accomplished

### 👥 Personnel & Practice Management
- **Patient Records & Profiles**: Dynamic age calculation, phone tracking, medical history logging, and profile page navigation.
- **Doctor Directory & Schedules**: Medical specialist directory, working schedule configuration, pricing, and profile management.
- **Dual View Interface**: Seamless toggle between **Responsive Data Tables** and **Glassmorphic Card Grids** across all directories.

### 🩺 Clinical Operations & Catalog
- **Specialties & Services Catalog**: Medical department management with image/icon upload previews and active status toggling.
- **Appointments Scheduling**: Interactive scheduling by doctor, service, time slots, and status badges (`confirmed`, `pending`, `canceled`).
- **Visits Care Module**: Record clinical consultations, procedure line items, payment methods (`Cash`, `Visa`, `PayPal`), and automatic revenue totals.

### 💳 Financial & Invoice Management
- **Income Invoices & Receipts**: Detailed breakdown of patient consultation fees with printable digital receipt modals.
- **Expenses & Outgoings**: Track operational clinic costs, inventory, and maintenance expenses with real-time financial metrics.
- **Financial Metrics Dashboard**: Summary KPI cards for Total Income, Outgoings, and Payment Method breakdowns.

### 🛡️ Role-Based Access Control (RBAC)
- **Granular Security Architecture**: Dual layer permission enforcement across Backend Middlewares (`secureRouteWithPermissions`) and Frontend Guards (`hasPermission`).
- **Default Clinic Roles**: Pre-seeded roles (`Admin`, `Doctor`, `Receptionist`, `Accountant`) with mapped permission lists.
- **Interactive Permission Matrix UI**: Visually create custom roles (*e.g., Lab Technician*) and toggle permission checkboxes grouped by module.

### 🐳 DevOps & Production Engineering
- **Multi-Container Docker Architecture**: Fully orchestrated `MySQL 8.0`, `Node.js Backend`, and `Nginx Frontend` services.
- **Automated Healthchecks**: Self-healing Docker containers with dependency health checks (`service_healthy`).
- **Database Entrypoint Script**: Automatic schema synchronization (`npx prisma db push`) and data seeding on container startup.
- **Persistent Data Storage**: Docker volumes for database persistence (`mysql_data`) and avatar uploads (`uploads_data`).
- **CI/CD Pipeline**: GitHub Actions workflow for automated linting, build validation, and Docker container verification on every commit.

---

## 🏗️ Tech Stack & Architecture

```
                                  +-------------------+
                                  |   Nginx Proxy     |  (Port 80)
                                  |   (Frontend SPA)  |
                                  +---------+---------+
                                            |
                                            v
                                  +-------------------+
                                  |   Express API     |  (Port 4000)
                                  |   (Node.js / TS)  |
                                  +----+--------+-----+
                                       |        |
                         +-------------+        +------------+
                         |                                   |
                         v                                   v
             +-----------------------+           +-----------------------+
             |    MySQL 8.0 Database |           | Persistent Uploads    |
             |    (Prisma ORM 5)     |           | Docker Volume         |
             +-----------------------+           +-----------------------+
```

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, React Router v6, Formik, Yup, React Icons |
| **Backend** | Node.js, Express.js, TypeScript, Routing Controllers, Joi Validation, JWT |
| **Database & ORM** | MySQL 8.0, Prisma ORM 5 |
| **DevOps & Infrastructure** | Docker, Docker Compose, Nginx, Shell Scripts, GitHub Actions CI/CD |

---

## 🚀 Quick Start (Docker Deployment)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed & running.
- [Git](https://git-scm.com/) installed.

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/clinic_system.git
   cd clinic_system
   ```

2. **Spin up Production Containers**:
   ```bash
   docker-compose up -d --build
   ```

3. **Access the System**:
   - **Frontend App**: `http://localhost:80`
   - **Backend API**: `http://localhost:4000`
   - **MySQL Database Port**: `localhost:3307`

4. **Default Credentials**:
   - **Email**: `admin@clinic.com`
   - **Password**: `Admin@123`

---

## 🛠️ DevOps Helper Scripts

Run system health monitor and database backup scripts via PowerShell:

```powershell
# Run System Health Monitor
powershell -ExecutionPolicy Bypass -File "./scripts/health_check.ps1"

# Backup MySQL Database
powershell -ExecutionPolicy Bypass -File "./scripts/backup_db.ps1"
```

---

## 🔮 Future Roadmap

- [ ] **Executive Analytics Dashboard**: Recharts-powered interactive analytics for revenue vs expenses and department performance.
- [ ] **PDF Prescription & Invoice Generator**: One-click downloadable PDF invoices and official medical prescriptions.
- [ ] **Interactive Calendar View**: FullCalendar integration for Drag & Drop appointment scheduling.
- [ ] **WhatsApp / SMS Reminders**: Automated appointment reminders sent to patients 24 hours prior to consultation.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

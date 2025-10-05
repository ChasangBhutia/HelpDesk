# HelpDesk Web Application

A modern, role-based ticketing system for managing IT or support requests in real-time. Built with **React**, **Node.js**, **Express**, **MongoDB**, and **Tailwind CSS**.

---

## About Admin Login
The **Admin** user has full access to the system and can manage tickets, agents, and users.  
- **Admin credentials:**  
  - Email: `admin@mail.com`  
  - Password: `admin123`  
- Admin can log in from any login page (user or agent).  
- Admin privileges include:
  - Viewing all tickets, users, and agents.  
  - Assigning tickets to agents.  
  - Updating ticket status, priority, and SLA.  
  - Adding internal comments.  
  - Viewing dashboard statistics like total tickets, total users, and total agents.  

---

## Features

### User
- Create tickets.
- View status of their tickets (open, in-progress, closed).
- Add comments to their tickets.

### Agent
- View tickets assigned to them.
- Assign unassigned tickets to themselves.
- Change ticket status.
- Add comments to tickets.

### Admin
- Full access to tickets, users, and agents.
- Assign tickets, change status/priority, add comments.
- Dashboard with statistics for total tickets, users, and agents.

---

## Technologies Used
- React, Tailwind CSS, React Router  
- Node.js, Express.js  
- MongoDB, Mongoose  
- Socket.io for real-time updates  
- Axios for API requests  
- dayjs for date formatting  

---

## Installation
1. Clone the repository and install dependencies.  
2. Create a `.env` file in the backend with your MongoDB URI and JWT secret.  
3. Run the backend and frontend servers.  
4. Use the admin credentials to log in.

---

## Future Enhancements
- Email notifications for ticket updates.
- Advanced search and filters for tickets.
- File attachments in tickets.
- SLA tracking with automated alerts.
- Analytics and reporting for admin dashboards.

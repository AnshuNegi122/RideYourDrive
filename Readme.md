# RideYourDrive - Car Rental Website

A complete car rental website with user authentication, car management, and company registration.

## Features

- User registration and login
- User profile management
- Car listing and management
- Company registration
- Responsive design

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript
- **CSS Frameworks**: Bootstrap, Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL

### Database Setup

1. Create a MySQL database named `car_rental`
2. Update the database connection details in `server.js` if needed:

```javascript
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password', // Change this to your MySQL password
  database: 'car_rental'
});
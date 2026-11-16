# Hospital Management System

This is my Full Stack Development subject project. It is a small web app for a hospital, where the admin can keep records of doctors and patients, and can book and manage appointments. I made the frontend in React and the backend in Node.js with Express. Both are in this single project folder.

Made by: Ujjwal Gupta (UID: 24BCS12567), Chandigarh University

## Features

- Admin login page (demo id and password are given below)
- Dashboard with total patients, total doctors, appointments today, scheduled appointments, completed appointments and total consultation fees collected
- Dashboard also has doctors by specialization and a separate list of today's appointments
- Doctors page - add, edit, delete, search by name or specialization, and filter by specialization
- Doctors can be sorted by name, fee or experience, and the showing list can be downloaded as a CSV file
- Clicking on a doctor name shows his full details and all his appointments
- Patients page - add, edit and delete patients, search by name or email, and see how many appointments each patient has
- Clicking on a patient name shows his details and all the appointments taken by him
- Appointments page - book an appointment by selecting a patient, a doctor, date and time
- Every appointment carries the consultation fee of the doctor; when an appointment is marked completed, the fee is counted as collected
- Mark Completed and Cancel option for every scheduled appointment
- Double booking is not allowed - the same doctor cannot take two appointments at the same date and time

## Technologies used

- React with Vite for the frontend
- Node.js and Express for the backend (REST API)
- Normal CSS for styling, I did not use any CSS library
- Data is stored in the server memory only (no database), so the data resets when the server restarts

## How to run

1. Install the packages - `npm install`
2. Build the frontend - `npm run build`
3. Start the server - `npm start`
4. Open http://localhost:5000 in the browser

For development I run two terminals - in the first terminal `npm run dev` starts the server on port 5000, and in the second terminal `npm run dev:client` starts the Vite page on port 5173. Open http://localhost:5173 in that case.

## Demo login

- Email: admin@hospital.com
- Password: admin123

## Note

I have kept an in-memory store to keep the project simple and easy to run. Later, MongoDB can be connected in place of the store file to save the data permanently.

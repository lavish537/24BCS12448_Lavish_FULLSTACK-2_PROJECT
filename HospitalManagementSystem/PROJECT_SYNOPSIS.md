# Hospital Management System

**Project Synopsis — Full Stack Development**
---

## 1. Abstract

This project is a full stack web application for managing a hospital. In many hospitals the records of doctors, patients and appointments are kept in registers or on paper slips, which is slow and creates mistakes like two patients getting the same doctor at the same time. In this system the admin can login and manage all the doctors and patients from one website. Appointments can be booked for a patient with a doctor on a date and time, and the system itself stops double booking of a doctor. All the totals like number of patients, appointments of today and the consultation fees collected are calculated by the system itself.

## 2. Problem Statement

In a manual system it is difficult to find out which doctors are available, which patient has an appointment with which doctor, and how much fee has been collected. Searching a record takes time and the same time slot can be given to two patients by mistake. This project solves these problems by keeping all the records in one system where appointment clashes are checked automatically at the time of booking.

## 3. Objectives

- To give a login facility to the hospital admin.
- To keep the complete record of doctors with search and filter options.
- To keep the record of patients and the appointments taken by them.
- To book, complete and cancel appointments with a date and time.
- To show the main figures of the hospital on a dashboard page.

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, CSS |
| Backend | Node.js, Express.js |
| API style | REST (JSON) |
| Data layer | In-memory data store with some starting data (MongoDB can be connected later) |
| Deployment | Vercel (frontend and API in one project) |

## 5. Modules / Features

1. **Login** – The admin logs in with email and password. Without login the inside pages do not open.
2. **Dashboard** – Shows total patients, total doctors, appointments today, scheduled appointments, completed appointments and the total consultation fees collected, along with doctors by specialization and the list of today's appointments.
3. **Doctor Management** – Doctors can be added, edited, deleted and searched. Filter by specialization is also given. Doctors can also be sorted by name, fee or experience, and the list can be downloaded in a CSV file. On clicking a doctor, his full details and his complete appointment history are shown.
4. **Patient Management** – Patients can be added, edited and deleted, and can be searched by name or email. The number of appointments of a patient is shown with his record, and on clicking a patient all his appointments are shown.
5. **Appointments** – An appointment is booked by selecting the patient and the doctor and giving a date, time and reason. The consultation fee of the doctor is attached to the appointment at booking time. If the doctor already has a scheduled appointment at the same date and time, the booking is not allowed and an error is shown.
6. **Complete and Cancel** – A scheduled appointment can be marked completed, after which its fee is counted in the fees collected on the dashboard, or it can be cancelled. Completed and cancelled appointments are shown separately in the history.

## 6. System Design (API Overview)

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login` | Check admin email and password, return a token |
| `GET /api/stats` | Give the numbers for the dashboard and count of doctors by specialization |
| `GET/POST /api/doctors`, `PUT/DELETE /api/doctors/:id` | Add, see, update and delete doctors (search and specialization filter also work) |
| `GET /api/doctors/:id` | See one doctor with the full history of his appointments |
| `GET/POST /api/patients`, `PUT/DELETE /api/patients/:id` | Add, see, update and delete patients |
| `GET /api/patients/:id` | See one patient with all his appointments |
| `GET /api/appointments`, `POST /api/appointments` | See all appointments, book a new appointment |
| `POST /api/appointments/:id/complete` | Mark an appointment completed, its fee is collected |
| `POST /api/appointments/:id/cancel` | Cancel a scheduled appointment |

The fee of an appointment is fixed at the time of booking from the doctor's fee, so if the doctor's fee changes later, the old appointments are not affected. Fees collected on the dashboard is the total fee of only the completed appointments.

## 7. Testing

I tested the project by running it on my own system. I checked the login with right and wrong password, the dashboard numbers, search and filter of doctors, adding and deleting a doctor, adding a patient, booking an appointment, the error message when the same doctor is booked again at the same date and time, completing an appointment and the change in fees collected. All these were working properly.

**Demo credentials:** `admin@hospital.com` / `admin123`

## 8. Future Scope

- MongoDB can be connected so that the data does not reset on restart.
- Patients can be given their own login to book and see their appointments.
- Doctors can be given their own login to see their daily appointment list.
- SMS or email can be sent to patients as an appointment reminder.

## 9. Conclusion

In this project I made a complete full stack application. The frontend is in React, the backend is an Express REST API, and the project can be deployed on the cloud. The main things I used in this project are login, CRUD operations, and small checks like the double-booking guard and fee calculation, which are used again and again in real projects.

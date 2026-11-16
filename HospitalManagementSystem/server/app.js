const express = require('express');
const cors = require('cors');
const store = require('./store');

const app = express();
app.use(cors());
app.use(express.json());

// small helper functions
function today() {
  return new Date().toISOString().slice(0, 10);
}

function doctorView(doctor) {
  const total = store.appointments.filter((a) => a.doctorId === doctor.id).length;
  return { ...doctor, totalAppointments: total };
}

function patientView(patient) {
  const total = store.appointments.filter((a) => a.patientId === patient.id).length;
  return { ...patient, totalAppointments: total };
}

// appointment ke sath patient aur doctor ke naam bhi jod kar bhejte hain
// taaki frontend ko alag se naam dhundne na pade
function appointmentView(appt) {
  const doctor = store.doctors.find((d) => d.id === appt.doctorId);
  const patient = store.patients.find((p) => p.id === appt.patientId);
  return {
    ...appt,
    doctorName: doctor ? doctor.name : 'Unknown doctor',
    specialization: doctor ? doctor.specialization : '',
    patientName: patient ? patient.name : 'Unknown patient',
  };
}

// login route - if email and password match then send a token
// (password is kept simple in this project, no hashing is done)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = store.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = 'hms-' + Buffer.from(user.email + ':' + Date.now()).toString('base64');
  res.json({ token, user: { name: user.name, email: user.email } });
});

// numbers for the dashboard page
app.get('/api/stats', (req, res) => {
  const t = today();
  const scheduled = store.appointments.filter((a) => a.status === 'scheduled');
  const completed = store.appointments.filter((a) => a.status === 'completed');
  // fee sirf completed appointments ki hi collected mani jati hai
  const feesCollected = completed.reduce((s, a) => s + a.fee, 0);
  const doctorsBySpecialization = {};
  store.doctors.forEach((d) => {
    doctorsBySpecialization[d.specialization] = (doctorsBySpecialization[d.specialization] || 0) + 1;
  });
  res.json({
    totalPatients: store.patients.length,
    totalDoctors: store.doctors.length,
    totalAppointments: store.appointments.length,
    appointmentsToday: store.appointments.filter((a) => a.date === t && a.status !== 'cancelled').length,
    scheduledAppointments: scheduled.length,
    completedAppointments: completed.length,
    feesCollected,
    doctorsBySpecialization,
  });
});

// doctor routes
app.get('/api/doctors', (req, res) => {
  let list = store.doctors;
  const { search, specialization } = req.query;
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (d) => d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
    );
  }
  if (specialization) list = list.filter((d) => d.specialization === specialization);
  res.json(list.map(doctorView));
});

// single doctor with all his appointments
app.get('/api/doctors/:id', (req, res) => {
  const doctor = store.doctors.find((d) => d.id === Number(req.params.id));
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  const history = store.appointments
    .filter((a) => a.doctorId === doctor.id)
    .sort((a, b) => b.id - a.id)
    .map((a) => {
      const patient = store.patients.find((p) => p.id === a.patientId);
      return {
        id: a.id,
        patientName: patient ? patient.name : 'Unknown patient',
        date: a.date,
        time: a.time,
        reason: a.reason,
        status: a.status,
        fee: a.fee,
      };
    });
  res.json({ ...doctorView(doctor), history });
});

app.post('/api/doctors', (req, res) => {
  const { name, specialization, qualification, experienceYears, fee, phone, email } = req.body || {};
  if (!name || !specialization || !qualification || experienceYears == null || fee == null || !phone || !email) {
    return res.status(400).json({ error: 'All fields are required: name, specialization, qualification, experienceYears, fee, phone, email' });
  }
  const doctor = {
    id: store.genDoctorId(),
    name,
    specialization,
    qualification,
    experienceYears: Number(experienceYears),
    fee: Number(fee),
    phone,
    email,
  };
  store.doctors.push(doctor);
  res.status(201).json(doctorView(doctor));
});

app.put('/api/doctors/:id', (req, res) => {
  const doctor = store.doctors.find((d) => d.id === Number(req.params.id));
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  const { name, specialization, qualification, experienceYears, fee, phone, email } = req.body || {};
  if (!name || !specialization || !qualification || experienceYears == null || fee == null || !phone || !email) {
    return res.status(400).json({ error: 'All fields are required: name, specialization, qualification, experienceYears, fee, phone, email' });
  }
  Object.assign(doctor, {
    name,
    specialization,
    qualification,
    experienceYears: Number(experienceYears),
    fee: Number(fee),
    phone,
    email,
  });
  res.json(doctorView(doctor));
});

app.delete('/api/doctors/:id', (req, res) => {
  const idx = store.doctors.findIndex((d) => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Doctor not found' });
  const [removed] = store.doctors.splice(idx, 1);
  res.json({ message: 'Doctor deleted', doctor: doctorView(removed) });
});

// patient routes
app.get('/api/patients', (req, res) => {
  res.json(store.patients.map(patientView));
});

// single patient with all his appointments
app.get('/api/patients/:id', (req, res) => {
  const patient = store.patients.find((p) => p.id === Number(req.params.id));
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const appointments = store.appointments
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => b.id - a.id)
    .map((a) => {
      const doctor = store.doctors.find((d) => d.id === a.doctorId);
      return {
        id: a.id,
        doctorName: doctor ? doctor.name : 'Unknown doctor',
        specialization: doctor ? doctor.specialization : '',
        date: a.date,
        time: a.time,
        reason: a.reason,
        status: a.status,
        fee: a.fee,
      };
    });
  res.json({ ...patientView(patient), appointments });
});

app.post('/api/patients', (req, res) => {
  const { name, email, phone, age, gender, bloodGroup } = req.body || {};
  if (!name || !email || !phone || age == null || !gender || !bloodGroup) {
    return res.status(400).json({ error: 'All fields are required: name, email, phone, age, gender, bloodGroup' });
  }
  const patient = { id: store.genPatientId(), name, email, phone, age: Number(age), gender, bloodGroup };
  store.patients.push(patient);
  res.status(201).json(patientView(patient));
});

app.put('/api/patients/:id', (req, res) => {
  const patient = store.patients.find((p) => p.id === Number(req.params.id));
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const { name, email, phone, age, gender, bloodGroup } = req.body || {};
  if (!name || !email || !phone || age == null || !gender || !bloodGroup) {
    return res.status(400).json({ error: 'All fields are required: name, email, phone, age, gender, bloodGroup' });
  }
  Object.assign(patient, { name, email, phone, age: Number(age), gender, bloodGroup });
  res.json(patientView(patient));
});

app.delete('/api/patients/:id', (req, res) => {
  const idx = store.patients.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Patient not found' });
  store.patients.splice(idx, 1);
  res.json({ message: 'Patient deleted' });
});

// appointment routes
app.get('/api/appointments', (req, res) => {
  const list = [...store.appointments].sort((a, b) => b.id - a.id).map(appointmentView);
  res.json(list);
});

app.post('/api/appointments', (req, res) => {
  const { patientId, doctorId, date, time, reason } = req.body || {};
  const doctor = store.doctors.find((d) => d.id === Number(doctorId));
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  const patient = store.patients.find((p) => p.id === Number(patientId));
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }
  // ek doctor ek hi time par ek hi patient ko dekh sakta hai
  // agar usi date aur time par pehle se scheduled appointment hai to naya nahi banega
  const clash = store.appointments.find(
    (a) => a.doctorId === doctor.id && a.date === date && a.time === time && a.status === 'scheduled'
  );
  if (clash) {
    return res.status(400).json({ error: 'Doctor already has an appointment at this date and time' });
  }
  const appt = {
    id: store.genAppointmentId(),
    patientId: patient.id,
    doctorId: doctor.id,
    date,
    time,
    reason: reason || 'General checkup',
    status: 'scheduled',
    fee: doctor.fee, // fee booking ke time par fix ho jati hai
  };
  store.appointments.push(appt);
  res.status(201).json(appointmentView(appt));
});

// appointment complete mark karne se uski fee collected mani jati hai
app.post('/api/appointments/:id/complete', (req, res) => {
  const appt = store.appointments.find((a) => a.id === Number(req.params.id));
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  if (appt.status !== 'scheduled') {
    return res.status(400).json({ error: `Appointment is already ${appt.status}` });
  }
  appt.status = 'completed';
  res.json(appointmentView(appt));
});

app.post('/api/appointments/:id/cancel', (req, res) => {
  const appt = store.appointments.find((a) => a.id === Number(req.params.id));
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  if (appt.status !== 'scheduled') {
    return res.status(400).json({ error: `Appointment is already ${appt.status}` });
  }
  appt.status = 'cancelled';
  res.json(appointmentView(appt));
});

app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

module.exports = app;

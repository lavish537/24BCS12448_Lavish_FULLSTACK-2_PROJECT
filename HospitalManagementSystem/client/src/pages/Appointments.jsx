import { useEffect, useState } from 'react';
import { api } from '../api';

function todayStr() {
  // yaha appointment ki date default aaj ki set ki hai
  return new Date().toISOString().slice(0, 10);
}

export default function Appointments() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = () => {
    api.doctors().then(setDoctors).catch(() => {});
    api.patients().then(setPatients).catch(() => {});
    api.appointments().then(setAppointments).catch(() => {});
  };
  useEffect(load, []);

  const scheduled = appointments.filter((a) => a.status === 'scheduled');
  const finished = appointments.filter((a) => a.status !== 'scheduled');

  const book = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    if (!patientId || !doctorId || !date || !time) {
      setError('Select a patient, a doctor, date and time.');
      return;
    }
    try {
      // agar doctor us time par busy hai to backend error bhejega, wahi yaha dikhega
      const appt = await api.bookAppointment({
        patientId: Number(patientId), doctorId: Number(doctorId), date, time, reason,
      });
      setOk(`Appointment booked for ${appt.patientName} with ${appt.doctorName} on ${appt.date} at ${appt.time}. Fee ₹${appt.fee}.`);
      setPatientId('');
      setDoctorId('');
      setDate(todayStr());
      setTime('10:00');
      setReason('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const doComplete = async (appt) => {
    setError('');
    setOk('');
    try {
      const done = await api.completeAppointment(appt.id);
      setOk(`"${done.patientName}" ka appointment complete ho gaya. Fee ₹${done.fee} collected.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const doCancel = async (appt) => {
    setError('');
    setOk('');
    try {
      await api.cancelAppointment(appt.id);
      setOk('Appointment cancelled.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Appointments</h1>
      <p className="page-sub">(book an appointment and manage it from this page)</p>
      {error && <div className="alert alert-error">{error}</div>}
      {ok && <div className="alert alert-ok">{ok}</div>}

      <form className="panel book-form" onSubmit={book}>
        <h2>Book an Appointment</h2>
        <label>
          Patient
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
            <option value="">Select a patient...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Doctor
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
            <option value="">Select a doctor...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} - {d.specialization} (₹{d.fee})</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Time
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <label>
          Reason
          <input type="text" placeholder="e.g. Fever checkup" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">Book Appointment</button>
      </form>

      <div className="panel">
        <h2>Scheduled Appointments</h2>
        <table className="table">
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Fee</th><th>Action</th></tr>
          </thead>
          <tbody>
            {scheduled.map((a) => (
              <tr key={a.id}>
                <td>{a.patientName}</td>
                <td>{a.doctorName} ({a.specialization})</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.reason}</td>
                <td>₹{a.fee}</td>
                <td>
                  <span className="row-actions">
                    <button className="btn btn-small btn-primary" onClick={() => doComplete(a)}>Mark Completed</button>
                    <button className="btn btn-small btn-danger" onClick={() => doCancel(a)}>Cancel</button>
                  </span>
                </td>
              </tr>
            ))}
            {scheduled.length === 0 && <tr><td colSpan="7">No scheduled appointments.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Completed / Cancelled</h2>
        <table className="table">
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Fee</th></tr>
          </thead>
          <tbody>
            {finished.map((a) => (
              <tr key={a.id}>
                <td>{a.patientName}</td>
                <td>{a.doctorName}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.reason}</td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                <td>₹{a.fee}</td>
              </tr>
            ))}
            {finished.length === 0 && <tr><td colSpan="7">No completed or cancelled appointment yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

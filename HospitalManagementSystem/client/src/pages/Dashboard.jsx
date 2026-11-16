import { useEffect, useState } from 'react';
import { api } from '../api';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  // fetch stats and appointments when the page opens
  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(e.message));
    api.appointments().then(setAppointments).catch(() => {});
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <p>Loading...</p>;

  const specs = Object.entries(stats.doctorsBySpecialization).sort((a, b) => b[1] - a[1]);
  const maxSpec = specs.length ? specs[0][1] : 1;

  // aaj ki appointments alag se nikalte hain, cancelled wali nahi dikhani
  const todays = appointments
    .filter((a) => a.date === todayStr() && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));
  const recent = appointments.slice(0, 6);

  const cards = [
    { label: 'Total Patients', value: stats.totalPatients, cls: 'strip-blue' },
    { label: 'Total Doctors', value: stats.totalDoctors, cls: 'strip-green' },
    { label: 'Appointments Today', value: stats.appointmentsToday, cls: 'strip-orange' },
    { label: 'Scheduled Appointments', value: stats.scheduledAppointments, cls: 'strip-purple' },
    { label: 'Completed Appointments', value: stats.completedAppointments, cls: 'strip-teal' },
    { label: 'Consultation Fees Collected', value: `₹${stats.feesCollected}`, cls: 'strip-red' },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="page-sub">(full summary of the hospital at one place)</p>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className={`stat-card ${c.cls}`} key={c.label}>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Doctors by Specialization</h2>
        {specs.map(([spec, count]) => (
          <div className="bar-row" key={spec}>
            <span className="bar-label bar-label-wide">{spec}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(count / maxSpec) * 100}%` }} />
            </div>
            <span className="bar-count">{count}</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Today's Appointments</h2>
        {todays.length === 0 && <p>No appointment is booked for today.</p>}
        {todays.length > 0 && (
          <table className="table">
            <thead>
              <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Reason</th><th>Status</th><th>Fee</th></tr>
            </thead>
            <tbody>
              {todays.map((a) => (
                <tr key={a.id}>
                  <td>{a.time}</td>
                  <td>{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.reason}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>₹{a.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2>Recent Appointments</h2>
        <table className="table">
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recent.map((a) => (
              <tr key={a.id}>
                <td>{a.patientName}</td>
                <td>{a.doctorName}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

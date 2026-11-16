import { useEffect, useState } from 'react';
import { api } from '../api';

const SPECIALIZATIONS = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'General Medicine', 'Neurology'];
const EMPTY = { name: '', specialization: 'General Medicine', qualification: '', experienceYears: '', fee: '', phone: '', email: '' };

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [modal, setModal] = useState(null); // null means modal is closed
  const [details, setDetails] = useState(null); // doctor whose details popup is open
  const [error, setError] = useState('');

  // fetch doctors from api
  const load = () => {
    api.doctors(search, specialization).then(setDoctors).catch((e) => setError(e.message));
  };
  useEffect(load, [search, specialization]);

  // sorting is done here on the doctors which are already loaded
  const sorted = [...doctors].sort((a, b) => {
    if (sortBy === 'fee') return a.fee - b.fee;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    return a.name.localeCompare(b.name);
  });

  // clicking on a doctor name opens his details and his appointments
  const openDetails = (d) => {
    api.doctor(d.id).then(setDetails).catch((e) => setError(e.message));
  };

  // makes a csv file of the doctors showing on the page and downloads it
  const exportCsv = () => {
    const rows = [['Name', 'Specialization', 'Qualification', 'Experience (Years)', 'Fee', 'Phone', 'Email']];
    sorted.forEach((d) => rows.push([d.name, d.specialization, d.qualification, d.experienceYears, d.fee, d.phone, d.email]));
    const text = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    link.download = 'doctors.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const openAdd = () => setModal({ mode: 'add', form: { ...EMPTY } });
  const openEdit = (d) =>
    setModal({
      mode: 'edit',
      id: d.id,
      form: {
        name: d.name, specialization: d.specialization, qualification: d.qualification,
        experienceYears: d.experienceYears, fee: d.fee, phone: d.phone, email: d.email,
      },
    });

  const save = async (e) => {
    e.preventDefault();
    const f = modal.form;
    if (!f.name.trim() || !f.qualification.trim() || !f.experienceYears || !f.fee || !f.phone.trim() || !f.email.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      const payload = { ...f, experienceYears: Number(f.experienceYears), fee: Number(f.fee) };
      if (modal.mode === 'add') await api.createDoctor(payload);
      else await api.updateDoctor(modal.id, payload);
      setModal(null);
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete "${d.name}"?`)) return;
    try {
      await api.deleteDoctor(d.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (k) => (e) => setModal({ ...modal, form: { ...modal.form, [k]: e.target.value } });

  return (
    <div>
      <div className="page-head">
        <h1>Doctors</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>
      <p className="page-sub">(all the doctors of the hospital, click on a doctor name to see his details)</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="filters">
        <input
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
          <option value="">All specializations</option>
          {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="fee">Sort: Fee</option>
          <option value="experience">Sort: Experience</option>
        </select>
        <button className="btn" type="button" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="doctor-grid">
        {sorted.map((d) => (
          <div className="doctor-card" key={d.id}>
            <div className="doctor-name clickable" onClick={() => openDetails(d)}>{d.name}</div>
            <div className="doctor-spec">{d.specialization}</div>
            <div className="doctor-meta"><span className="tag">{d.qualification}</span> {d.experienceYears} yrs experience</div>
            <div className="doctor-meta">Fee ₹{d.fee} | {d.phone}</div>
            <div className="doctor-foot">
              <span className="badge badge-scheduled">{d.totalAppointments} appointments</span>
              <span className="row-actions">
                <button className="btn btn-small" onClick={() => openEdit(d)}>Edit</button>
                <button className="btn btn-small btn-danger" onClick={() => remove(d)}>Delete</button>
              </span>
            </div>
          </div>
        ))}
        {doctors.length === 0 && <p>No doctors found for this search.</p>}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{modal.mode === 'add' ? 'Add Doctor' : 'Edit Doctor'}</h2>
            <label>Full Name<input value={modal.form.name} onChange={set('name')} required /></label>
            <label>Specialization
              <select value={modal.form.specialization} onChange={set('specialization')}>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Qualification<input value={modal.form.qualification} onChange={set('qualification')} required /></label>
            <label>Experience (Years)<input type="number" min="0" value={modal.form.experienceYears} onChange={set('experienceYears')} required /></label>
            <label>Consultation Fee (₹)<input type="number" min="0" value={modal.form.fee} onChange={set('fee')} required /></label>
            <label>Phone<input value={modal.form.phone} onChange={set('phone')} required /></label>
            <label>Email<input type="email" value={modal.form.email} onChange={set('email')} required /></label>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {details && (
        <div className="modal-backdrop" onClick={() => setDetails(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{details.name}</h2>
            <table className="table">
              <tbody>
                <tr><th>Specialization</th><td><span className="tag">{details.specialization}</span></td></tr>
                <tr><th>Qualification</th><td>{details.qualification}</td></tr>
                <tr><th>Experience</th><td>{details.experienceYears} years</td></tr>
                <tr><th>Fee</th><td>₹{details.fee}</td></tr>
                <tr><th>Phone</th><td>{details.phone}</td></tr>
                <tr><th>Email</th><td>{details.email}</td></tr>
              </tbody>
            </table>
            <h3>Appointment History</h3>
            {details.history.length === 0 && <p>This doctor has no appointment yet.</p>}
            {details.history.length > 0 && (
              <table className="table">
                <thead>
                  <tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Fee</th></tr>
                </thead>
                <tbody>
                  {details.history.map((h) => (
                    <tr key={h.id}>
                      <td>{h.patientName}</td>
                      <td>{h.date}</td>
                      <td>{h.time}</td>
                      <td>{h.reason}</td>
                      <td><span className={`badge badge-${h.status}`}>{h.status}</span></td>
                      <td>₹{h.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

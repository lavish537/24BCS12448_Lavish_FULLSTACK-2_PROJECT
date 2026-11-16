import { useEffect, useState } from 'react';
import { api } from '../api';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY = { name: '', email: '', phone: '', age: '', gender: 'Male', bloodGroup: 'O+' };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [details, setDetails] = useState(null); // patient whose details popup is open
  const [error, setError] = useState('');

  const load = () => api.patients().then(setPatients).catch((e) => setError(e.message));
  useEffect(load, []);

  // search patient by name or email, filtering is done on the loaded list
  const shown = patients.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  // clicking on a patient name shows his details and all his appointments
  const openDetails = (p) => {
    api.patient(p.id).then(setDetails).catch((e) => setError(e.message));
  };

  const openAdd = () => setModal({ mode: 'add', form: { ...EMPTY } });
  const openEdit = (p) =>
    setModal({
      mode: 'edit', id: p.id,
      form: { name: p.name, email: p.email, phone: p.phone, age: p.age, gender: p.gender, bloodGroup: p.bloodGroup },
    });

  const save = async (e) => {
    e.preventDefault();
    const f = modal.form;
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim() || !f.age) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      const payload = { ...f, age: Number(f.age) };
      if (modal.mode === 'add') await api.createPatient(payload);
      else await api.updatePatient(modal.id, payload);
      setModal(null);
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete patient "${p.name}"?`)) return;
    try {
      await api.deletePatient(p.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (k) => (e) => setModal({ ...modal, form: { ...modal.form, [k]: e.target.value } });

  return (
    <div>
      <div className="page-head">
        <h1>Patients</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
      </div>
      <p className="page-sub">(all the registered patients, click on a name to see his appointments)</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="filters">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Age</th><th>Gender</th><th>Blood Group</th><th>Appointments</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td><span className="clickable" onClick={() => openDetails(p)}>{p.name}</span></td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.bloodGroup}</td>
                <td>{p.totalAppointments}</td>
                <td className="row-actions">
                  <button className="btn btn-small" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-small btn-danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="8">No patients found.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{modal.mode === 'add' ? 'Add Patient' : 'Edit Patient'}</h2>
            <label>Full Name<input value={modal.form.name} onChange={set('name')} required /></label>
            <label>Email<input type="email" value={modal.form.email} onChange={set('email')} required /></label>
            <label>Phone<input value={modal.form.phone} onChange={set('phone')} required /></label>
            <label>Age<input type="number" min="0" value={modal.form.age} onChange={set('age')} required /></label>
            <label>Gender
              <select value={modal.form.gender} onChange={set('gender')}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label>Blood Group
              <select value={modal.form.bloodGroup} onChange={set('bloodGroup')}>
                {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
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
                <tr><th>Email</th><td>{details.email}</td></tr>
                <tr><th>Phone</th><td>{details.phone}</td></tr>
                <tr><th>Age / Gender</th><td>{details.age} / {details.gender}</td></tr>
                <tr><th>Blood Group</th><td>{details.bloodGroup}</td></tr>
                <tr><th>Total Appointments</th><td>{details.totalAppointments}</td></tr>
              </tbody>
            </table>
            <h3>Appointments</h3>
            {details.appointments.length === 0 && <p>This patient has no appointment yet.</p>}
            {details.appointments.length > 0 && (
              <table className="table">
                <thead>
                  <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Fee</th></tr>
                </thead>
                <tbody>
                  {details.appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.doctorName}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>{a.reason}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      <td>₹{a.fee}</td>
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

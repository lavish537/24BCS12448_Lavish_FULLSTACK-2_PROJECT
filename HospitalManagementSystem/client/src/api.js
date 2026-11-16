// all api calls of the frontend go from this file
async function request(path, options = {}) {
  const token = localStorage.getItem('hms_token');
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  stats: () => request('/api/stats'),
  doctors: (search = '', specialization = '') => {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (specialization) qs.set('specialization', specialization);
    const s = qs.toString();
    return request('/api/doctors' + (s ? `?${s}` : ''));
  },
  doctor: (id) => request(`/api/doctors/${id}`),
  createDoctor: (d) => request('/api/doctors', { method: 'POST', body: JSON.stringify(d) }),
  updateDoctor: (id, d) => request(`/api/doctors/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteDoctor: (id) => request(`/api/doctors/${id}`, { method: 'DELETE' }),
  patients: () => request('/api/patients'),
  patient: (id) => request(`/api/patients/${id}`),
  createPatient: (p) => request('/api/patients', { method: 'POST', body: JSON.stringify(p) }),
  updatePatient: (id, p) => request(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deletePatient: (id) => request(`/api/patients/${id}`, { method: 'DELETE' }),
  appointments: () => request('/api/appointments'),
  bookAppointment: (a) => request('/api/appointments', { method: 'POST', body: JSON.stringify(a) }),
  completeAppointment: (id) => request(`/api/appointments/${id}/complete`, { method: 'POST' }),
  cancelAppointment: (id) => request(`/api/appointments/${id}/cancel`, { method: 'POST' }),
};

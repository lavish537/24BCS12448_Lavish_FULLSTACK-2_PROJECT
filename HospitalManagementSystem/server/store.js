// data is stored in memory for now, no database is used in this project
// when the server restarts, data comes back to this seed data

function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // to get the date in YYYY-MM-DD format
}

const users = [
  { id: 1, name: 'Hospital Admin', email: 'admin@hospital.com', password: 'admin123', role: 'admin' },
];

const doctors = [
  { id: 1,  name: 'Dr. Rajesh Khanna',  specialization: 'Cardiology',      qualification: 'MBBS, MD',  experienceYears: 15, fee: 800, phone: '98110 11223', email: 'rajesh.khanna@hospital.com' },
  { id: 2,  name: 'Dr. Priya Sharma',   specialization: 'Pediatrics',      qualification: 'MBBS, MD',  experienceYears: 10, fee: 600, phone: '98220 22334', email: 'priya.sharma@hospital.com' },
  { id: 3,  name: 'Dr. Amit Verma',     specialization: 'Orthopedics',     qualification: 'MBBS, MS',  experienceYears: 12, fee: 700, phone: '98330 33445', email: 'amit.verma@hospital.com' },
  { id: 4,  name: 'Dr. Sneha Reddy',    specialization: 'Dermatology',     qualification: 'MBBS, MD',  experienceYears: 8,  fee: 500, phone: '98440 44556', email: 'sneha.reddy@hospital.com' },
  { id: 5,  name: 'Dr. Vikram Singh',   specialization: 'General Medicine', qualification: 'MBBS',     experienceYears: 9,  fee: 400, phone: '98550 55667', email: 'vikram.singh@hospital.com' },
  { id: 6,  name: 'Dr. Ananya Iyer',    specialization: 'Neurology',       qualification: 'MBBS, DM',  experienceYears: 14, fee: 900, phone: '98660 66778', email: 'ananya.iyer@hospital.com' },
  { id: 7,  name: 'Dr. Rohan Kapoor',   specialization: 'Cardiology',      qualification: 'MBBS, MD',  experienceYears: 11, fee: 800, phone: '98770 77889', email: 'rohan.kapoor@hospital.com' },
  { id: 8,  name: 'Dr. Kavita Joshi',   specialization: 'General Medicine', qualification: 'MBBS, MD', experienceYears: 7,  fee: 400, phone: '98880 88990', email: 'kavita.joshi@hospital.com' },
  { id: 9,  name: 'Dr. Arjun Malhotra', specialization: 'Orthopedics',     qualification: 'MBBS, MS',  experienceYears: 6,  fee: 650, phone: '98990 99001', email: 'arjun.malhotra@hospital.com' },
  { id: 10, name: 'Dr. Meera Nair',     specialization: 'Dermatology',     qualification: 'MBBS, MD',  experienceYears: 13, fee: 550, phone: '98101 10112', email: 'meera.nair@hospital.com' },
];

const patients = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com', phone: '98110 22334', age: 34, gender: 'Male',   bloodGroup: 'B+' },
  { id: 2, name: 'Priya Singh',  email: 'priya.singh@gmail.com',  phone: '98220 33445', age: 28, gender: 'Female', bloodGroup: 'O+' },
  { id: 3, name: 'Rohan Mehta',  email: 'rohan.mehta@gmail.com',  phone: '9833044556',  age: 45, gender: 'Male',   bloodGroup: 'A+' },
  { id: 4, name: 'Sneha Patel',  email: 'sneha.patel@gmail.com',  phone: '98440 55667', age: 31, gender: 'Female', bloodGroup: 'AB+' },
  { id: 5, name: 'Aman Gupta',   email: 'aman.gupta@gmail.com',   phone: '9855066778',  age: 52, gender: 'Male',   bloodGroup: 'O-' },
  { id: 6, name: 'Kavya Nair',   email: 'kavya.nair@gmail.com',   phone: '98660 77889', age: 24, gender: 'Female', bloodGroup: 'B-' },
  { id: 7, name: 'Aditya Rao',   email: 'aditya.rao@gmail.com',   phone: '98770 88990', age: 39, gender: 'Male',   bloodGroup: 'A-' },
  { id: 8, name: 'Divya Menon',  email: 'divya.menon@gmail.com',  phone: '98880 99001', age: 60, gender: 'Female', bloodGroup: 'O+' },
];

// appointments ki dates aaj ke hisab se rakhi hain taaki dashboard hamesha bhara hua dikhe
// fee appointment ke time par doctor ki fee se copy hoti hai
// appointment 1 and 2 - aaj ke hai, abhi scheduled hai
// appointment 3 and 4 - purane hai, complete ho chuke hai (inki fee collected mani jayegi)
// appointment 5 and 6 - aane wale dinon ke scheduled hai
// appointment 7 - cancel ho gaya tha
// appointment 8 - 3 din baad ka scheduled hai
const appointments = [
  { id: 1, patientId: 1, doctorId: 1, date: datePlus(0),  time: '10:00', reason: 'Chest pain checkup',   status: 'scheduled', fee: 800 },
  { id: 2, patientId: 2, doctorId: 2, date: datePlus(0),  time: '11:30', reason: 'Child fever',          status: 'scheduled', fee: 600 },
  { id: 3, patientId: 3, doctorId: 3, date: datePlus(-2), time: '09:30', reason: 'Knee pain',            status: 'completed', fee: 700 },
  { id: 4, patientId: 4, doctorId: 5, date: datePlus(-5), time: '12:00', reason: 'General checkup',      status: 'completed', fee: 400 },
  { id: 5, patientId: 5, doctorId: 4, date: datePlus(1),  time: '10:30', reason: 'Skin allergy',         status: 'scheduled', fee: 500 },
  { id: 6, patientId: 6, doctorId: 6, date: datePlus(2),  time: '13:00', reason: 'Frequent headaches',   status: 'scheduled', fee: 900 },
  { id: 7, patientId: 7, doctorId: 7, date: datePlus(-1), time: '15:00', reason: 'ECG test',             status: 'cancelled', fee: 800 },
  { id: 8, patientId: 8, doctorId: 8, date: datePlus(3),  time: '09:00', reason: 'Fever and weakness',   status: 'scheduled', fee: 400 },
];

let nextDoctorId = doctors.length + 1;
let nextPatientId = patients.length + 1;
let nextAppointmentId = appointments.length + 1;

module.exports = {
  users,
  doctors,
  patients,
  appointments,
  datePlus,
  genDoctorId: () => nextDoctorId++,
  genPatientId: () => nextPatientId++,
  genAppointmentId: () => nextAppointmentId++,
};

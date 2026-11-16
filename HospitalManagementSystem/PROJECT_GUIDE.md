# Hospital Management System — Pura Project Samjho (Simple Bhasha Me)

Ye file tumhare liye hai — project ko khud samajhne aur viva/presentation me bolne ke liye.
Project by: Ujjwal Gupta (24BCS12567), Chandigarh University.

---

## 1. Project hai kya?

Ek website hai jo hospital ka roz ka kaam digital karti hai. Pehle hospital me register me likha jata tha — kaunsa doctor kab baithega, kis patient ki appointment kis time hai, kitni fees aayi. Is system me ye sab ek website se hota hai:

- Admin login karta hai
- Doctors aur patients add/edit/delete karta hai
- Patient ke liye doctor ke sath appointment book karta hai
- Appointment complete hoti hai to uski fees "collected" me jud jati hai
- Ek hi doctor ko ek hi time par do appointments nahi mil sakti — system khud rok deta hai

## 2. Tech stack (kya-kya use hua aur kyun)

| Cheez | Kaam |
|---|---|
| React | Frontend — jo screen par dikhta hai |
| Vite | React project ko chalane/build karne ka tool |
| React Router | Alag-alag pages (Dashboard, Doctors, Patients...) ke beech jaane ke liye |
| Node.js + Express | Backend — server aur API banane ke liye |
| In-memory store | Data abhi server ki memory me rehta hai (ek JS file me) |
| Vercel | Website ko internet par live rakhne ke liye (deployment) |

"Full stack" isliye kahlata hai kyunki frontend + backend + API + deployment — poora chain bana hai.

## 3. Folder structure (kaunsi file me kya hai)

```
client/                 -> frontend (React)
  index.html            -> page ka title aur root div
  src/main.jsx          -> React ko browser me chalu karne wali file
  src/App.jsx           -> saare routes aur sidebar wala layout
  src/api.js            -> frontend se backend ko call karne wali saari functions
  src/pages/Login.jsx         -> login page
  src/pages/Dashboard.jsx     -> stats, specialization chart, aaj ki appointments
  src/pages/Doctors.jsx       -> doctors CRUD, search, filter, sort, CSV export, details
  src/pages/Patients.jsx      -> patients CRUD, search, details
  src/pages/Appointments.jsx  -> appointment book karna, complete/cancel karna
  src/styles.css        -> poori design ek hi CSS file me

server/                 -> backend (Node + Express)
  store.js              -> saara data (doctors, patients, appointments) + shuru ka seed data
  app.js                -> saari API routes
  index.js              -> server ko start karne wali file (local run ke liye)

api/index.js            -> Vercel ke liye entry (wahi app.js ko chalata hai)
vercel.json             -> Vercel ko batata hai: frontend build karo, /api wali
                           requests backend ko bhejo
```

## 4. Kaam kaise karta hai? (ek request ki kahani)

Maan lo tum Doctors page par "cardio" search karte ho:

1. React wala page `api.js` ki function ko bolta hai — "bhai, cardio wale doctors la do"
2. Wo function ek request bhejti hai: `GET /api/doctors?search=cardio`
3. Backend (Express) request leta hai, `store.js` ke data me se search karta hai
4. Jo doctors milte hain, unhe JSON ki form me wapas bhej deta hai
5. React us data ko cards me dikha deta hai

Har feature isi tarike se chalta hai — frontend kabhi seedha data ko nahi chhuta, hamesha API se mangta hai. Yahi full stack ka matlab hai.

## 5. Sabse important logic (viva me kaam ayega)

### (a) Double booking rokna (sabse khaas feature)
Jab appointment book hoti hai, backend pehle store me dekhta hai — kya isi doctor ki, isi date par, isi time par, koi **scheduled** appointment pehle se hai? Agar hai, to 400 error aur saaf message: "Doctor already has an appointment at this date and time". Completed ya cancelled appointment usi slot ko block nahi karti, kyunki wo time ab khali hai.

### (b) Fees collected ka hisab
Har doctor ki fee uske record me hai (jaise cardiologist ki ₹800). Appointment book hote time wahi fee **appointment par copy** ho jati hai. Dashboard par Fees Collected = sirf **completed** appointments ki fee ka total. Scheduled wali abhi aani hai, cancelled wali kabhi nahi aayegi, isliye dono count nahi hoti.

### (c) Appointment ka status
Teen status hain — **scheduled → completed** ya **scheduled → cancelled**. Ek baar complete ya cancel ho jaye to use dobara badla nahi ja sakta, backend error deta hai. Ye check bhi backend par hai, frontend par nahi, taaki koi galti se do baar complete na kar de.

### (d) Dashboard ke numbers
`/api/stats` ek hi call me saare numbers deta hai — total patients, total doctors, aaj ki appointments (aaj ki date se match karke), scheduled/completed ki ginti aur fees collected. Doctors by specialization bhi wahi se aata hai, dashboard uski bar chart jaisi list bana deta hai.

### (e) Details pages ka data
Doctor ke naam par click karne se `GET /api/doctors/:id` chalta hai jo doctor ke sath uski **saari appointments ki history** (patient ke naam ke sath) deta hai. Patient ke saath ulta hota hai — uski appointments doctor ke naam ke sath aati hain. Naam backend par hi jod kar bhejte hain (appointmentView jaisa helper), frontend ko id se naam dhundna nahi padta.

### (f) Dates ka khaas khayal
Seed data ki dates "aaj" ke hisab se banti hain — `datePlus(0)` matlab aaj, `datePlus(-2)` matlab 2 din pehle, `datePlus(3)` matlab 3 din baad. Isliye demo kabhi bhi chalao, 2 appointments hamesha aaj ki, 2 completed aur 1 cancelled taiyaar milti hain.

## 6. Saari APIs ek nazar me

| API | Kaam |
|---|---|
| POST /api/auth/login | Login check, token milta hai |
| GET /api/stats | Dashboard ke numbers |
| GET /api/doctors | Doctors ki list (search/specialization ke saath) |
| GET /api/doctors/:id | Ek doctor + uski appointment history |
| POST /api/doctors | Naya doctor add |
| PUT /api/doctors/:id | Doctor edit |
| DELETE /api/doctors/:id | Doctor delete |
| GET /api/patients, POST, PUT, DELETE | Patients ka pura CRUD |
| GET /api/patients/:id | Ek patient + uski appointments |
| GET /api/appointments | Saari appointments (naam aur status ke saath) |
| POST /api/appointments | Appointment book (double booking check ke sath) |
| POST /api/appointments/:id/complete | Appointment complete, fee collected |
| POST /api/appointments/:id/cancel | Appointment cancel |

## 7. Login aur security

- Sirf ek admin hai: admin@hospital.com / admin123
- Login sahi ho to server ek **token** deta hai, jo browser ki localStorage me `hms_token` naam se save hota hai
- Bina token ke koi page nahi khulta — App.jsx har route par pehle token check karta hai, na ho to login page par bhej deta hai
- Galat password par server 401 error deta hai (401 ka matlab — "tum woh nahi ho jo kehte ho")

## 8. Deployment (live kaise jayega)

- Vercel par pura project ek hi jagah deploy ho sakta hai
- `vercel.json` do kaam karta hai: (1) frontend build karke static site ki tarah deta hai, (2) `/api/...` wali har request ko backend wali serverless function par bhej deta hai
- Ek imaandari wali baat: data memory me hai, isliye server restart/redeploy par data wapas seed par aa jata hai. Kal ko isme MongoDB jod diya jaye to data permanent ho jayega — code isiliye alag modules me rakha hai taaki ye badlav asan ho.

## 9. Apne computer par chalana ho to

```
npm install     (ek baar — saari libraries aa jayengi)
npm run build   (frontend ka final version banta hai)
npm start       (server chalu — browser me localhost:5000 kholo)
```

Dev mode me do terminal: pehle me `npm run dev` (server, port 5000), dusre me `npm run dev:client` (Vite, port 5173).

## 10. Ek line me poora project

"React se bana frontend, Express se bani REST API se baat karta hai; data ek store module me rehta hai; appointment booking par double-booking check, complete hone par fee ka hisab — sab backend par hota hai; aur poora project ek hi folder se localhost ya Vercel par chal jata hai."

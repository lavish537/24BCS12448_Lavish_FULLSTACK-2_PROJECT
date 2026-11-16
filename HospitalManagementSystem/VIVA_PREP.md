# Viva Preparation — Hospital Management System
### (Teacher ke aam sawal aur muh-zabani bolne layak jawab — Ujjwal Gupta, 24BCS12567)

**Q1. Tumhara project kya karta hai?**
Sir/Ma'am, ye ek Hospital Management System hai. Isme admin login karke doctors aur patients ko manage kar sakta hai, appointments book kar sakta hai, aur dashboard par pata chalta hai ki aaj kitni appointments hain aur kitni consultation fees collect ho chuki hain.

**Q2. Ye full stack project kyun kahlata hai?**
Kyunki isme dono hisse hain — frontend jo user ko dikhta hai (React se bana hai) aur backend jo server par chalta hai (Node.js aur Express). Frontend backend se API ke through baat karta hai.

**Q3. API kya hoti hai? Tumne kaunsi APIs banayi hain?**
API ek tarika hai jisse frontend backend se data mangta ya bhejta hai. Maine REST APIs banayi hain — jaise GET /api/doctors se saare doctors aate hain, POST /api/appointments se appointment book hoti hai, aur POST /api/appointments/:id/complete se appointment complete mark hoti hai.

**Q4. CRUD kya hota hai?**
CRUD matlab Create, Read, Update, Delete. Doctors aur patients dono par maine charon operations lagaye hain — naya doctor add karna, list dekhna, edit karna aur delete karna.

**Q5. Ek hi doctor ki double booking kaise rukti hai?**
Appointment book karte time backend pehle check karta hai ki usi doctor ka, usi date aur usi time par koi scheduled appointment to nahi hai. Agar hai, to booking nahi hoti aur 400 error ke sath saaf message aata hai — "Doctor already has an appointment at this date and time".

**Q6. Consultation fee kaise calculate hoti hai?**
Har doctor ki apni fee store hai. Appointment book hote time wahi fee appointment par copy ho jati hai — isliye baad me doctor ki fee badal bhi jaye to purani appointments par farak nahi padta. Jab appointment complete mark hoti hai, uski fee dashboard par "Fees Collected" me jud jati hai. Cancelled aur scheduled appointments ki fee count nahi hoti.

**Q7. Appointment ke status kaun-kaun se hain?**
Teen status hain — scheduled (abhi honi hai), completed (ho gayi hai) aur cancelled (radd ho gayi). Status appointment ke sath hi store hota hai, aur complete ya cancel sirf scheduled appointment ka hi ho sakta hai, warna backend error deta hai.

**Q8. Login system kaise kaam karta hai?**
Admin apna email aur password dalta hai, backend use check karta hai. Sahi ho to ek token milta hai jo browser me save hota hai. Bina token ke andar ke pages khulte hi nahi — user seedha login page par bhej diya jata hai. Galat password par server 401 error deta hai.

**Q9. Data kaha store hota hai?**
Abhi ke liye data server ki memory me ek store file me rakha hai, jisme pehle se kuch doctors, patients aur appointments bhare hue hain. Server restart hone par data wapas seed data par aa jata hai. Future me isi ko MongoDB database se jod sakte hain, code usi hisab se alag-alag modules me rakha hai taaki badlav asan ho.

**Q10. Dashboard ke numbers kahan se aate hain?**
Backend me ek /api/stats API hai. Wo store ke data se hisab lagati hai — total patients, total doctors, aaj ki appointments, scheduled aur completed ki ginti, aur completed appointments ki fees ka total. Frontend bas use dikhata hai, hisab backend par hota hai.

**Q11. Seed data ki dates aaj ke hisab se kyun rakhi hain?**
Ek helper function hai datePlus, jo aaj ki date se kuch din aage ya peeche ki date deta hai. Seed appointments ki dates usi se bani hain — kuch aaj ki, kuch purani completed, kuch aane wali. Isse project jab bhi chalao, dashboard hamesha bhara hua dikhta hai, purani fix dates ka jhanjhat nahi rehta.

**Q12. Agar isme aage aur features jodne hon to kya jodoge?**
Teen cheezein — pehle MongoDB se data permanent karna, dusra patients ke liye apna login taaki wo khud appointment book kar saken, aur teesra appointment se pehle patient ko SMS ya email reminder bhejna.

---
**Agar koi sawal atak jaye to ye line kaam ayegi:**
"Sir/Ma'am, is hisse ko maine [module ka naam] me rakha hai taaki code saaf rahe — jaise saare API routes server ki app wali file me hain aur data store alag file me hai."

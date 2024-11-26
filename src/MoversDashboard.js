// import React, { useEffect, useState } from 'react';
// import { getDatabase, ref, set, onValue } from "firebase/database";
// import { getAuth } from "firebase/auth";
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';

// const MoversDashboard = () => {
//   const [dayOff, setDayOff] = useState(null);
//   const [dayOffsList, setDayOffsList] = useState([]);
  
//   const auth = getAuth();
//   const db = getDatabase();

//   // Fetch the user's day offs when the component mounts
//   useEffect(() => {
//     const user = auth.currentUser;

//     if (user) {
//       const dayOffsRef = ref(db, `dayOffs/${user.uid}`);
//       const unsubscribe = onValue(dayOffsRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           const dayOffsArray = Object.values(data);
//           setDayOffsList(dayOffsArray);
//         } else {
//           setDayOffsList([]);
//         }
//       });

//       return () => unsubscribe();
//     }
//   }, [auth.currentUser, db]); // Added db to dependencies

//   // Function to save the selected day off to Firebase
//   const saveDayOff = () => {
//     const user = auth.currentUser;

//     if (!user) {
//       console.error("User is not authenticated.");
//       alert("You must be logged in to save a day off.");
//       return; // Early exit if user is not authenticated
//     }

//     if (dayOff) {
//       const dayOffRef = ref(db, `dayOffs/${user.uid}/${dayOff.getTime()}`);

//       set(dayOffRef, {
//         day: dayOff.toISOString(),
//       })
//       .then(() => {
//         alert('Day off saved!');
//       })
//       .catch((error) => {
//         console.error("Error saving day off: ", error.message);
//       });
//     } else {
//       console.error("No dayOff selected.");
//       alert("Please select a day off before saving.");
//     }
//   };

//   return (
//     <div>
//       <h1>Movers Dashboard</h1>

//       <h2>Select a Day Off:</h2>
//       <Calendar
//         onChange={(date) => {
//           setDayOff(date); // Update dayOff state when a date is selected
//         }}
//         value={dayOff} // Set the current value of the calendar
//       />
//       <button onClick={saveDayOff}>Save Day Off</button>

//       <h2>Current Day Offs:</h2>
//       {dayOffsList.length > 0 ? (
//         <ul>
//           {dayOffsList.map((off, index) => (
//             <li key={index}>{new Date(off.day).toLocaleDateString()}</li>
//           ))}
//         </ul>
//       ) : (
//         <p>No day offs selected.</p>
//       )}
//     </div>
//   );
// };

// export default MoversDashboard;




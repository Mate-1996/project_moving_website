import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { ref, set } from "firebase/database";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import CSS for the calendar
import './Dashboard.css'; // Create a CSS file for styling

const Dashboard = () => {
  const [date, setDate] = useState(new Date());
  const [dayOff, setDayOff] = useState('');

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setDayOff(selectedDate.toDateString());
  };

  const saveDayOff = () => {
    const dayOffRef = ref(db, 'dayOffs/' + new Date().getTime()); // Unique key for each day off
    set(dayOffRef, {
      day: dayOff,
    }).then(() => {
      alert('Day off saved!');
    }).catch((error) => {
      console.error("Error saving day off: ", error);
    });
  };

  return (
    <div className="dashboard">
      <h1>Mover Dashboard</h1>
      <div className="upcoming-moves">
        <h2>Upcoming Moves</h2>
        {/* Placeholder for upcoming moves */}
        <p>No moves scheduled yet.</p>
      </div>
      <div className="calendar-section">
        <h2>Select Your Day Off</h2>
        <Calendar
          onChange={handleDateChange}
          value={date}
          tileClassName={({ date, view }) => view === 'month' && date.getDay() === 0 ? 'highlight' : null} // Optional: Highlight Sundays
        />
        <button onClick={saveDayOff} disabled={!dayOff}>Save Day Off</button>
      </div>
    </div>
  );
};

export default Dashboard;
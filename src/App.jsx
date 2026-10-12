import { useState } from 'react';
import { loadAuth, saveAuth } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import DoctorsPage from './pages/DoctorsPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';

// התפריט משתנה לפי התפקיד. ההרשאה האמיתית נבדקת בשרת - כאן רק מסתירים מסכים לא רלוונטיים
const menus = {
  Admin: [
    ['booking', 'קביעת תור'],
    ['appointments', 'כל התורים'],
    ['patients', 'מטופלים'],
    ['doctors', 'רופאים']
  ],
  Patient: [
    ['booking', 'קביעת תור'],
    ['appointments', 'התורים שלי'],
    ['profile', 'הפרטים שלי'],
    ['doctors', 'רופאים']
  ]
};

export default function App() {
  const [auth, setAuth] = useState(loadAuth());
  const [page, setPage] = useState('booking');

  const login = (data) => {
    saveAuth(data);
    setAuth(data);
    setPage('booking');
  };
  const logout = () => {
    saveAuth(null);
    setAuth(null);
  };

  if (!auth) return <LoginPage onLogin={login} />;

  const menu = menus[auth.role] || menus.Patient;

  return (
    <div className="container">
      <header>
        <h1>מרפאת שיניים - זימון תורים</h1>
        <div>
          {auth.email} ({auth.role === 'Admin' ? 'מנהל' : 'מטופל'}){' '}
          <button className="link" onClick={logout}>התנתקות</button>
        </div>
      </header>
      <nav>
        {menu.map(([key, label]) => (
          <button key={key} className={page === key ? 'active' : ''} onClick={() => setPage(key)}>{label}</button>
        ))}
      </nav>
      {page === 'booking' && <BookingPage auth={auth} />}
      {page === 'appointments' && <AppointmentsPage auth={auth} />}
      {page === 'doctors' && <DoctorsPage auth={auth} />}
      {page === 'patients' && auth.role === 'Admin' && <PatientsPage />}
      {page === 'profile' && <MyProfilePage auth={auth} />}
    </div>
  );
}

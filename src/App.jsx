import { useState } from 'react';
import { loadAuth, saveAuth } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import DoctorsPage from './pages/DoctorsPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';

export default function App() {
  const [auth, setAuth] = useState(loadAuth());
  const [page, setPage] = useState('booking');

  const login = (data) => {
    saveAuth(data);
    setAuth(data);
  };
  const logout = () => {
    saveAuth(null);
    setAuth(null);
  };

  if (!auth) return <LoginPage onLogin={login} />;

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
        <button className={page === 'booking' ? 'active' : ''} onClick={() => setPage('booking')}>קביעת תור</button>
        <button className={page === 'appointments' ? 'active' : ''} onClick={() => setPage('appointments')}>התורים</button>
        <button className={page === 'doctors' ? 'active' : ''} onClick={() => setPage('doctors')}>רופאים</button>
      </nav>
      {page === 'booking' && <BookingPage auth={auth} />}
      {page === 'appointments' && <AppointmentsPage auth={auth} />}
      {page === 'doctors' && <DoctorsPage />}
    </div>
  );
}

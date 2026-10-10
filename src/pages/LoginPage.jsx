import { useState } from 'react';
import { api } from '../api.js';
import { ErrorBox } from '../components.jsx';

const emptyRegister = {
  name: '', phone: '', email: '', password: '', dateOfBirth: '', gender: 'Male',
  address: { city: '', street: '', buildingNumber: '' }
};

// מסך התחברות והרשמה: שומר את ה-JWT שהתקבל מהשרת
export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState({ email: 'patient@clinic.local', password: 'Patient123!' });
  const [register, setRegister] = useState(emptyRegister);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = mode === 'login'
        ? await api('/api/auth/login', { method: 'POST', body: login })
        : await api('/api/auth/register', { method: 'POST', body: register });
      onLogin(data);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const reg = (field) => (e) => setRegister({ ...register, [field]: e.target.value });
  const addr = (field) => (e) => setRegister({ ...register, address: { ...register.address, [field]: e.target.value } });

  return (
    <div className="container narrow">
      <h1>מרפאת שיניים</h1>
      <nav>
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>התחברות</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>הרשמה</button>
      </nav>
      <form className="card" onSubmit={submit}>
        {mode === 'login' ? (
          <>
            <label>אימייל<input type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></label>
            <label>סיסמה<input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></label>
            <p className="muted">משתמשי דמו: admin@clinic.local / Admin123! &nbsp;|&nbsp; patient@clinic.local / Patient123!</p>
          </>
        ) : (
          <>
            <label>שם מלא<input value={register.name} onChange={reg('name')} /></label>
            <label>טלפון<input value={register.phone} onChange={reg('phone')} placeholder="050-1234567" /></label>
            <label>אימייל<input type="email" value={register.email} onChange={reg('email')} /></label>
            <label>סיסמה (8 תווים לפחות)<input type="password" value={register.password} onChange={reg('password')} /></label>
            <label>תאריך לידה<input type="date" value={register.dateOfBirth} onChange={reg('dateOfBirth')} /></label>
            <label>מגדר
              <select value={register.gender} onChange={reg('gender')}>
                <option value="Male">זכר</option>
                <option value="Female">נקבה</option>
              </select>
            </label>
            <label>עיר<input value={register.address.city} onChange={addr('city')} /></label>
            <label>רחוב<input value={register.address.street} onChange={addr('street')} /></label>
            <label>מספר בניין<input value={register.address.buildingNumber} onChange={addr('buildingNumber')} /></label>
          </>
        )}
        <button type="submit" disabled={busy}>{mode === 'login' ? 'התחבר' : 'הירשם'}</button>
        <ErrorBox error={error} />
      </form>
    </div>
  );
}

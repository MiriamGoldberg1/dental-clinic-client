import { useState } from 'react';
import { api } from '../api.js';
import { ErrorBox, PersonFields, emptyPerson } from '../components.jsx';

// מסך התחברות והרשמה: שומר את ה-JWT שהתקבל מהשרת
export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState({ email: 'admin@clinic.local', password: 'Admin123!' });
  const [person, setPerson] = useState(emptyPerson);
  const [account, setAccount] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = mode === 'login'
        ? await api('/api/auth/login', { method: 'POST', body: login })
        : await api('/api/auth/register', { method: 'POST', body: { ...person, ...account } });
      onLogin(data);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>מרפאת שיניים</h1>
      <nav>
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>התחברות</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>הרשמה כמטופל</button>
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
            <label>אימייל<input type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} /></label>
            <label>סיסמה (8 תווים לפחות)<input type="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} /></label>
            <PersonFields value={person} onChange={setPerson} />
          </>
        )}
        <button type="submit" disabled={busy}>{mode === 'login' ? 'התחבר' : 'הירשם'}</button>
        <ErrorBox error={error} />
      </form>
    </div>
  );
}

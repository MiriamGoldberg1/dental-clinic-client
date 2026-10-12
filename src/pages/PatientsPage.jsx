import { useEffect, useState } from 'react';
import { api, treatmentLabels } from '../api.js';
import { ErrorBox, Pager, PersonFields, emptyPerson, genderLabels, formatAddress } from '../components.jsx';

// מטופלים (מנהל בלבד): רשימה עם דפדוף, חיפוש ומיון; פרטים; הוספה ועריכה
export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const [view, setView] = useState(null); // { mode: 'details' | 'edit' | 'create', id }

  useEffect(() => {
    const query = new URLSearchParams({ page, pageSize: 5, search, sortBy });
    api(`/api/patients?${query}`).then(setResult).catch(setError);
  }, [page, search, sortBy, reload]);

  const closeAndReload = () => {
    setView(null);
    setReload((r) => r + 1);
  };

  if (view?.mode === 'details') return <PatientProfile id={view.id} onBack={() => setView(null)} />;
  if (view?.mode === 'edit' || view?.mode === 'create') {
    return <PatientForm id={view.id} onDone={closeAndReload} onCancel={() => setView(null)} />;
  }

  return (
    <div className="card">
      <div className="row-between">
        <h2>מטופלים</h2>
        <button className="primary" onClick={() => setView({ mode: 'create' })}>+ הוספת מטופל</button>
      </div>
      <div className="filters">
        <input placeholder="חיפוש לפי שם או טלפון" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">מיון לפי שם</option>
          <option value="dateOfBirth">מיון לפי תאריך לידה</option>
        </select>
      </div>
      <ErrorBox error={error} />
      <table>
        <thead>
          <tr><th>שם</th><th>טלפון</th><th>גיל</th><th>מגדר</th><th>כתובת</th><th></th></tr>
        </thead>
        <tbody>
          {result?.items.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.phone}</td><td>{p.age}</td>
              <td>{genderLabels[p.gender]}</td><td>{formatAddress(p.address)}</td>
              <td className="row-actions">
                <button className="link" onClick={() => setView({ mode: 'details', id: p.id })}>פרטים ותורים</button>
                <button className="link" onClick={() => setView({ mode: 'edit', id: p.id })}>עריכה</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager result={result} onPage={setPage} />
    </div>
  );
}

// פרטי מטופל: פרטים אישיים, History (מ-GET /api/patients/{id}) ותורים (מ-GET /api/patients/{id}/appointments)
export function PatientProfile({ id, onBack, onEdit }) {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/api/patients/${id}`).then(setPatient).catch(setError);
    api(`/api/patients/${id}/appointments`).then(setAppointments).catch(setError);
  }, [id]);

  return (
    <div className="card">
      {onBack && <button className="link" onClick={onBack}>→ חזרה לרשימה</button>}
      <ErrorBox error={error} />
      {patient && (
        <>
          <div className="row-between">
            <h2>{patient.name}</h2>
            {onEdit && <button className="primary" onClick={onEdit}>עריכת פרטים</button>}
          </div>
          <dl className="details">
            <dt>טלפון</dt><dd>{patient.phone}</dd>
            <dt>כתובת</dt><dd>{formatAddress(patient.address)}</dd>
            <dt>תאריך לידה</dt><dd>{patient.dateOfBirth} (גיל {patient.age})</dd>
            <dt>מגדר</dt><dd>{genderLabels[patient.gender]}</dd>
          </dl>

          <h3>היסטוריית תורים (History)</h3>
          {patient.history.length === 0 ? <p className="muted">אין תורים</p> : (
            <table>
              <thead><tr><th>תאריך</th><th>שעה</th><th>רופא</th><th>סוג</th></tr></thead>
              <tbody>
                {patient.history.map((h) => (
                  <tr key={h.id}><td>{h.date}</td><td>{h.time}</td><td>{h.doctorName}</td><td>{treatmentLabels[h.treatmentType]}</td></tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>כל התורים שקבע המטופל</h3>
          {appointments.length === 0 ? <p className="muted">אין תורים</p> : (
            <table>
              <thead><tr><th>תאריך</th><th>שעה</th><th>רופא</th><th>סוג</th><th>הערות</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}><td>{a.date}</td><td>{a.time}</td><td>{a.doctor.name}</td><td>{treatmentLabels[a.treatmentType]}</td><td>{a.notes || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

// טופס הוספה / עריכה של מטופל. הוספה - מנהל בלבד; עריכה - מנהל או המטופל עצמו
export function PatientForm({ id, onDone, onCancel }) {
  const [person, setPerson] = useState(emptyPerson);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/api/patients/${id}`).then((p) => {
      setPerson({ name: p.name, phone: p.phone, dateOfBirth: p.dateOfBirth, gender: p.gender, address: p.address });
    }).catch(setError);
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (id) await api(`/api/patients/${id}`, { method: 'PUT', body: person });
      else await api('/api/patients', { method: 'POST', body: person });
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{id ? 'עריכת פרטי מטופל' : 'הוספת מטופל'}</h2>
      <PersonFields value={person} onChange={setPerson} />
      <div className="actions">
        <button type="submit" className="primary" disabled={busy}>שמירה</button>
        <button type="button" onClick={onCancel}>ביטול</button>
      </div>
      <ErrorBox error={error} />
    </form>
  );
}

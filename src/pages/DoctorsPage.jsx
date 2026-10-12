import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ErrorBox, Pager, PersonFields, emptyPerson, genderLabels, formatAddress } from '../components.jsx';

// רופאים: רשימה עם דפדוף, חיפוש, סינון ומיון; פרטי רופא; הוספה ועריכה (מנהל בלבד)
export default function DoctorsPage({ auth }) {
  const isAdmin = auth.role === 'Admin';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specializationId, setSpecializationId] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [specializations, setSpecializations] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const [view, setView] = useState(null); // { mode: 'details' | 'edit' | 'create', id }

  useEffect(() => {
    api('/api/specializations').then(setSpecializations).catch(setError);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams({ page, pageSize: 5, search, sortBy });
    if (specializationId) query.set('specializationId', specializationId);
    api(`/api/doctors?${query}`).then(setResult).catch(setError);
  }, [page, search, specializationId, sortBy, reload]);

  const closeAndReload = () => {
    setView(null);
    setReload((r) => r + 1);
  };

  if (view?.mode === 'details') return <DoctorDetails id={view.id} onBack={() => setView(null)} />;
  if (view?.mode === 'edit' || view?.mode === 'create') {
    return <DoctorForm id={view.id} specializations={specializations} onDone={closeAndReload} onCancel={() => setView(null)} />;
  }

  return (
    <div className="card">
      <div className="row-between">
        <h2>רופאי המרפאה</h2>
        {isAdmin && <button className="primary" onClick={() => setView({ mode: 'create' })}>+ הוספת רופא</button>}
      </div>
      <div className="filters">
        <input placeholder="חיפוש לפי שם" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={specializationId} onChange={(e) => { setSpecializationId(e.target.value); setPage(1); }}>
          <option value="">כל ההתמחויות</option>
          {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">מיון לפי שם</option>
          <option value="employmentStartDate">מיון לפי ותק</option>
        </select>
      </div>
      <ErrorBox error={error} />
      <table>
        <thead>
          <tr><th>שם</th><th>טלפון</th><th>גיל</th><th>התמחויות</th><th>עובד במרפאה מ-</th><th></th></tr>
        </thead>
        <tbody>
          {result?.items.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td><td>{d.phone}</td><td>{d.age}</td>
              <td>{d.specializations.join(', ')}</td><td>{d.employmentStartDate}</td>
              <td className="row-actions">
                <button className="link" onClick={() => setView({ mode: 'details', id: d.id })}>פרטים</button>
                {isAdmin && <button className="link" onClick={() => setView({ mode: 'edit', id: d.id })}>עריכה</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager result={result} onPage={setPage} />
    </div>
  );
}

// פרטי רופא לפי מזהה
function DoctorDetails({ id, onBack }) {
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/api/doctors/${id}`).then(setDoctor).catch(setError);
  }, [id]);

  return (
    <div className="card">
      <button className="link" onClick={onBack}>→ חזרה לרשימה</button>
      <ErrorBox error={error} />
      {doctor && (
        <>
          <h2>{doctor.name}</h2>
          <dl className="details">
            <dt>טלפון</dt><dd>{doctor.phone}</dd>
            <dt>כתובת</dt><dd>{formatAddress(doctor.address)}</dd>
            <dt>תאריך לידה</dt><dd>{doctor.dateOfBirth} (גיל {doctor.age})</dd>
            <dt>מגדר</dt><dd>{genderLabels[doctor.gender]}</dd>
            <dt>תחילת עבודה במרפאה</dt><dd>{doctor.employmentStartDate}</dd>
            <dt>התמחויות</dt><dd>{doctor.specializations.join(', ') || '-'}</dd>
          </dl>
        </>
      )}
    </div>
  );
}

// טופס הוספה / עריכה של רופא (מנהל בלבד). ב-409 - היומן של הרופא עודכן באותו רגע
function DoctorForm({ id, specializations, onDone, onCancel }) {
  const [person, setPerson] = useState(emptyPerson);
  const [employmentStartDate, setEmploymentStartDate] = useState('');
  const [specializationIds, setSpecializationIds] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/api/doctors/${id}`).then((d) => {
      setPerson({ name: d.name, phone: d.phone, dateOfBirth: d.dateOfBirth, gender: d.gender, address: d.address });
      setEmploymentStartDate(d.employmentStartDate);
      setSpecializationIds(specializations.filter((s) => d.specializations.includes(s.name)).map((s) => s.id));
    }).catch(setError);
  }, [id, specializations]);

  const toggle = (specId) => setSpecializationIds((ids) =>
    ids.includes(specId) ? ids.filter((x) => x !== specId) : [...ids, specId]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const body = { ...person, employmentStartDate, specializationIds };
      if (id) await api(`/api/doctors/${id}`, { method: 'PUT', body });
      else await api('/api/doctors', { method: 'POST', body });
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{id ? 'עריכת רופא' : 'הוספת רופא'}</h2>
      <PersonFields value={person} onChange={setPerson} />
      <label>תאריך תחילת עבודה במרפאה
        <input type="date" value={employmentStartDate} onChange={(e) => setEmploymentStartDate(e.target.value)} />
      </label>
      <fieldset>
        <legend>התמחויות</legend>
        {specializations.map((s) => (
          <label key={s.id} className="checkbox">
            <input type="checkbox" checked={specializationIds.includes(s.id)} onChange={() => toggle(s.id)} /> {s.name}
          </label>
        ))}
      </fieldset>
      <div className="actions">
        <button type="submit" className="primary" disabled={busy}>שמירה</button>
        <button type="button" onClick={onCancel}>ביטול</button>
      </div>
      <ErrorBox error={error} />
    </form>
  );
}

import { useEffect, useState } from 'react';
import { api, treatmentLabels } from '../api.js';
import { ErrorBox, Pager } from '../components.jsx';

// תורים: רשימה עם דפדוף, סינון ומיון; פרטי תור; ביטול. מטופל רואה רק את שלו - השרת אוכף זאת
export default function AppointmentsPage({ auth }) {
  const isAdmin = auth.role === 'Admin';
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ doctorId: '', patientId: '', fromDate: '', toDate: '', treatmentType: '' });
  const [sort, setSort] = useState('date-desc');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api('/api/doctors?pageSize=100').then((r) => setDoctors(r.items)).catch(setError);
    if (isAdmin) api('/api/patients?pageSize=100').then((r) => setPatients(r.items)).catch(setError);
  }, [isAdmin]);

  useEffect(() => {
    const [sortBy, direction] = sort.split('-');
    const query = new URLSearchParams({ page, pageSize: 10, sortBy, sortDesc: direction === 'desc' });
    Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
    api(`/api/appointments?${query}`).then(setResult).catch(setError);
  }, [page, filters, sort, reload]);

  const setFilter = (key) => (e) => {
    setFilters({ ...filters, [key]: e.target.value });
    setPage(1);
  };

  const remove = async (id) => {
    if (!window.confirm('לבטל את התור?')) return;
    setError(null);
    try {
      await api(`/api/appointments/${id}`, { method: 'DELETE' });
      setSelectedId(null);
      setReload((r) => r + 1);
    } catch (err) {
      setError(err);
    }
  };

  if (selectedId) return <AppointmentDetails id={selectedId} onBack={() => setSelectedId(null)} onDelete={remove} />;

  return (
    <div className="card">
      <h2>{isAdmin ? 'כל התורים' : 'התורים שלי'}</h2>
      <div className="filters">
        <select value={filters.doctorId} onChange={setFilter('doctorId')}>
          <option value="">כל הרופאים</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {isAdmin && (
          <select value={filters.patientId} onChange={setFilter('patientId')}>
            <option value="">כל המטופלים</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        <select value={filters.treatmentType} onChange={setFilter('treatmentType')}>
          <option value="">כל סוגי הטיפול</option>
          {Object.entries(treatmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label className="inline">מתאריך<input type="date" value={filters.fromDate} onChange={setFilter('fromDate')} /></label>
        <label className="inline">עד תאריך<input type="date" value={filters.toDate} onChange={setFilter('toDate')} /></label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date-desc">מהחדש לישן</option>
          <option value="date-asc">מהישן לחדש</option>
          <option value="doctor-asc">לפי רופא</option>
          {isAdmin && <option value="patient-asc">לפי מטופל</option>}
        </select>
      </div>
      <ErrorBox error={error} />
      <table>
        <thead>
          <tr><th>תאריך</th><th>שעה</th><th>רופא</th><th>מטופל</th><th>סוג</th><th></th></tr>
        </thead>
        <tbody>
          {result?.items.map((a) => (
            <tr key={a.id}>
              <td>{a.date}</td><td>{a.time}</td><td>{a.doctor.name}</td><td>{a.patient.name}</td>
              <td>{treatmentLabels[a.treatmentType]}</td>
              <td className="row-actions">
                <button className="link" onClick={() => setSelectedId(a.id)}>פרטים</button>
                <button className="link" onClick={() => remove(a.id)}>ביטול תור</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager result={result} onPage={setPage} />
    </div>
  );
}

// פרטי תור לפי מזהה (GET /api/appointments/{id})
function AppointmentDetails({ id, onBack, onDelete }) {
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/api/appointments/${id}`).then(setAppointment).catch(setError);
  }, [id]);

  return (
    <div className="card">
      <button className="link" onClick={onBack}>→ חזרה לרשימה</button>
      <ErrorBox error={error} />
      {appointment && (
        <>
          <h2>תור מספר {appointment.id}</h2>
          <dl className="details">
            <dt>תאריך ושעה</dt><dd>{appointment.date} בשעה {appointment.time}</dd>
            <dt>רופא</dt><dd>{appointment.doctor.name} ({appointment.doctor.phone})</dd>
            <dt>מטופל</dt><dd>{appointment.patient.name} ({appointment.patient.phone})</dd>
            <dt>סוג טיפול</dt><dd>{treatmentLabels[appointment.treatmentType]}</dd>
            <dt>הערות</dt><dd>{appointment.notes || '-'}</dd>
            <dt>נקבע בתאריך</dt><dd>{new Date(appointment.createdAtUtc).toLocaleString('he-IL')}</dd>
          </dl>
          <button onClick={() => onDelete(appointment.id)}>ביטול התור</button>
        </>
      )}
    </div>
  );
}

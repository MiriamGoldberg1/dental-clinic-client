import { useEffect, useState } from 'react';
import { api, treatmentLabels } from '../api.js';
import { ErrorBox, Pager } from '../components.jsx';

// רשימת תורים עם דפדוף מול השרת. מטופל רואה רק את שלו - השרת אוכף זאת, לא הלקוח
export default function AppointmentsPage({ auth }) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams({ page, pageSize: 10, sortDesc: true });
    api(`/api/appointments?${query}`).then(setResult).catch(setError);
  }, [page, reload]);

  const remove = async (id) => {
    if (!window.confirm('לבטל את התור?')) return;
    setError(null);
    try {
      await api(`/api/appointments/${id}`, { method: 'DELETE' });
      setReload((r) => r + 1);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="card">
      <h2>{auth.role === 'Admin' ? 'כל התורים' : 'התורים שלי'}</h2>
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
              <td><button className="link" onClick={() => remove(a.id)}>ביטול</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager result={result} onPage={setPage} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ErrorBox, Pager } from '../components.jsx';

// רשימת רופאים עם דפדוף אמיתי מול השרת (page / pageSize נשלחים ב-query)
export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams({ page, pageSize: 5, search });
    api(`/api/doctors?${query}`).then(setResult).catch(setError);
  }, [page, search]);

  return (
    <div className="card">
      <h2>רופאי המרפאה</h2>
      <input placeholder="חיפוש לפי שם" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      <ErrorBox error={error} />
      <table>
        <thead>
          <tr><th>שם</th><th>טלפון</th><th>גיל</th><th>התמחויות</th><th>עובד במרפאה מ-</th></tr>
        </thead>
        <tbody>
          {result?.items.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td><td>{d.phone}</td><td>{d.age}</td>
              <td>{d.specializations.join(', ')}</td><td>{d.employmentStartDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager result={result} onPage={setPage} />
    </div>
  );
}

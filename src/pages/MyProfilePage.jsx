import { useState } from 'react';
import { PatientProfile, PatientForm } from './PatientsPage.jsx';

// "הפרטים שלי" למטופל: צפייה בפרטים, בהיסטוריה ובתורים, ועדכון הפרטים האישיים
export default function MyProfilePage({ auth }) {
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(0);

  if (!auth.patientId) return <div className="card">למשתמש זה אין רשומת מטופל.</div>;

  if (editing) {
    return (
      <PatientForm
        id={auth.patientId}
        onDone={() => { setEditing(false); setVersion((v) => v + 1); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return <PatientProfile key={version} id={auth.patientId} onEdit={() => setEditing(true)} />;
}

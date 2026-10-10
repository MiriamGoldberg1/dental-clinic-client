import { useEffect, useState } from 'react';
import { api, toIsoDate, treatmentLabels } from '../api.js';
import { ErrorBox } from '../components.jsx';

// מסך הפעולה על המשאב המוגבל: בחירת רופא, תאריך ושעה פנויה וקביעת תור.
// אם השעה נתפסה בינתיים השרת מחזיר 409 ומוצגת הודעה ברורה.
export default function BookingPage({ auth }) {
  const isAdmin = auth.role === 'Admin';
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [treatmentType, setTreatmentType] = useState('Examination');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [raceResults, setRaceResults] = useState(null);

  useEffect(() => {
    api('/api/doctors?pageSize=100').then((r) => {
      setDoctors(r.items);
      if (r.items.length) setDoctorId(String(r.items[0].id));
    }).catch(setError);
    if (isAdmin) {
      api('/api/patients?pageSize=100').then((r) => {
        setPatients(r.items);
        if (r.items.length) setPatientId(String(r.items[0].id));
      }).catch(setError);
    }
  }, [isAdmin]);

  const loadSlots = () => {
    if (!doctorId || !date) return;
    api(`/api/doctors/${doctorId}/available-slots?date=${date}`)
      .then((r) => {
        setSlots(r.slots);
        setTime(r.slots[0] || '');
      })
      .catch(setError);
  };
  useEffect(loadSlots, [doctorId, date]);

  const request = () => ({
    doctorId: Number(doctorId),
    patientId: isAdmin ? Number(patientId) : null,
    date,
    time,
    treatmentType
  });

  const book = async () => {
    setError(null);
    setSuccess(null);
    setRaceResults(null);
    try {
      const created = await api('/api/appointments', { method: 'POST', body: request() });
      setSuccess(`התור נקבע: ${created.date} בשעה ${created.time} אצל ${created.doctor.name}`);
    } catch (err) {
      setError(err);
    }
    loadSlots();
  };

  // הדגמת תחרות: שתי בקשות זהות נשלחות באותו רגע. אחת מקבלת 201, השנייה 409
  const race = async () => {
    setError(null);
    setSuccess(null);
    const body = request();
    const results = await Promise.allSettled([
      api('/api/appointments', { method: 'POST', body }),
      api('/api/appointments', { method: 'POST', body })
    ]);
    setRaceResults(results.map((r, i) => r.status === 'fulfilled'
      ? `בקשה ${i + 1}: 201 - התור נקבע`
      : `בקשה ${i + 1}: ${r.reason.status} - ${r.reason.message}`));
    loadSlots();
  };

  return (
    <div className="card">
      <h2>קביעת תור</h2>
      <p className="muted">ניתן לקבוע תורים בימים א'-ה' בין 11:00 ל-18:00.</p>
      <label>רופא
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
      {isAdmin && (
        <label>מטופל
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      <label>תאריך<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <label>שעה
        <select value={time} onChange={(e) => setTime(e.target.value)}>
          {slots.length === 0 && <option value="">אין שעות פנויות בתאריך זה</option>}
          {slots.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>סוג טיפול
        <select value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)}>
          {Object.entries(treatmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="actions">
        <button onClick={book} disabled={!time}>קבע תור</button>
        <button className="secondary" onClick={race} disabled={!time}>הדגמה: שתי בקשות בו-זמנית</button>
      </div>

      {success && <div className="alert success">{success}</div>}
      <ErrorBox error={error} />
      {raceResults && (
        <div className="alert conflict">
          <strong>תוצאות שתי הבקשות המקבילות:</strong>
          <ul>{raceResults.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

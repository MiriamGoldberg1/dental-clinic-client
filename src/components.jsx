// רכיבים משותפים: הודעת שגיאה, דפדוף, ושדות פרטים אישיים (משותפים למטופל, לרופא ולהרשמה)
export function ErrorBox({ error }) {
  if (!error) return null;
  const isConflict = error.status === 409;
  return (
    <div className={isConflict ? 'alert conflict' : 'alert error'}>
      <strong>{isConflict ? 'התנגשות (409): ' : error.status ? `שגיאה (${error.status}): ` : ''}</strong>
      {error.message}
      {error.errors && (
        <ul>
          {Object.entries(error.errors).map(([field, messages]) => (
            <li key={field}>{field}: {messages.join(', ')}</li>
          ))}
        </ul>
      )}
      {error.correlationId && <div className="muted">מזהה בקשה ללוג: {error.correlationId}</div>}
    </div>
  );
}

export function Pager({ result, onPage }) {
  if (!result) return null;
  return (
    <div className="pager">
      <button disabled={result.page <= 1} onClick={() => onPage(result.page - 1)}>הקודם</button>
      <span>עמוד {result.page} מתוך {Math.max(result.totalPages, 1)} ({result.totalCount} רשומות)</span>
      <button disabled={result.page >= result.totalPages} onClick={() => onPage(result.page + 1)}>הבא</button>
    </div>
  );
}

export const emptyPerson = {
  name: '', phone: '', dateOfBirth: '', gender: 'Male',
  address: { city: '', street: '', buildingNumber: '' }
};

// שדות משותפים: שם, טלפון, תאריך לידה, מגדר וכתובת
export function PersonFields({ value, onChange }) {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });
  const setAddress = (field) => (e) => onChange({ ...value, address: { ...value.address, [field]: e.target.value } });
  return (
    <>
      <label>שם מלא<input value={value.name} onChange={set('name')} /></label>
      <label>טלפון<input value={value.phone} onChange={set('phone')} placeholder="050-1234567" /></label>
      <label>תאריך לידה<input type="date" value={value.dateOfBirth} onChange={set('dateOfBirth')} /></label>
      <label>מגדר
        <select value={value.gender} onChange={set('gender')}>
          <option value="Male">זכר</option>
          <option value="Female">נקבה</option>
        </select>
      </label>
      <label>עיר<input value={value.address.city} onChange={setAddress('city')} /></label>
      <label>רחוב<input value={value.address.street} onChange={setAddress('street')} /></label>
      <label>מספר בניין<input value={value.address.buildingNumber} onChange={setAddress('buildingNumber')} /></label>
    </>
  );
}

export const genderLabels = { Male: 'זכר', Female: 'נקבה' };

export function formatAddress(a) {
  return a ? `${a.street} ${a.buildingNumber}, ${a.city}` : '';
}

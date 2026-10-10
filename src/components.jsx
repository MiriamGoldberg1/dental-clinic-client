// רכיבים משותפים קטנים: הודעת שגיאה ופקדי דפדוף
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

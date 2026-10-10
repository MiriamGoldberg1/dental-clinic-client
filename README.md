# מרפאת שיניים - לקוח React

לקוח מינימלי שמדגים את שרת ה-API מקצה לקצה:
- **התחברות והרשמה** - ה-JWT נשמר ונשלח ב-header בשם `Authorization` בכל בקשה.
- **רשימות עם דפדוף אמיתי מול השרת** - רופאים ותורים (`page`, `pageSize` נשלחים לשרת).
- **קביעת תור** - בחירת רופא, תאריך ושעה פנויה.
- **הצגת 409** - אם השעה נתפסה, מוצגת הודעה ברורה. הכפתור "הדגמה: שתי בקשות בו-זמנית" שולח שתי בקשות זהות במקביל: אחת מקבלת 201 והשנייה 409.

## הרצה

דרישות: Node.js 18 ומעלה, ושרת ה-API רץ על http://localhost:5001 (ניתן לשנות בקובץ `.env`).

```bash
npm install
npm run dev
```

ואז לפתוח http://localhost:5173

משתמשי דמו: `admin@clinic.local` / `Admin123!`, `patient@clinic.local` / `Patient123!`




git add .
git commit -m "first commit"
git branch -M main
git push -u origin main
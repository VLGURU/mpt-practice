import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { students: [] });

await db.read();
if (!db.data) {
  db.data = { students: [] };
  await db.write();
}

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const computeRating = (avgGrade, skills = []) => {
  const base = Number(avgGrade) || 0;
  const bonus = Array.isArray(skills) ? skills.length * 0.1 : 0;
  return Math.min(5, Math.round((base + bonus) * 10) / 10);
};

const getDirectionName = (groupName = '') => {
  const group = groupName.split(/[;,]/)[0].trim();
  if (group.startsWith('П')) return 'Программисты';
  if (group.startsWith('БАС')) return 'Беспилотники';
  if (group.startsWith('ИС')) return 'Информационные системы';
  if (group.startsWith('Ю')) return 'Юристы';
  if (group.startsWith('Т')) return 'Тестировщики';
  if (group.startsWith('Э')) return 'Электроники';
  if (group.startsWith('СА')) return 'Системные администраторы';
  if (group.startsWith('БД')) return 'Базы данных';
  if (group.startsWith('БИ')) return 'Бизнес-информатика';
  if (group.startsWith('ВД')) return 'Веб-дизайн';
  if (group.startsWith('ВТ')) return 'Вычислительная техника';
  return 'Не указано';
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/students', async (req, res) => {
  await db.read();
  const { created_by } = req.query;
  if (created_by) {
    const filtered = db.data.students.filter((student) => student.created_by === created_by);
    return res.json(filtered);
  }
  res.json(db.data.students || []);
});

app.get('/api/students/:id', async (req, res) => {
  await db.read();
  const student = db.data.students.find((item) => item.id === req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Студент не найден' });
  }
  res.json(student);
});

app.post('/api/students', async (req, res) => {
  const { full_name, group_name, avg_grade, skills = [], about = '', goal = '', created_by = null } = req.body || {};

  if (!full_name || !group_name) {
    return res.status(400).json({ message: 'ФИО и группа обязательны' });
  }

  const rating = computeRating(avg_grade, skills);

  const student = {
    id: nanoid(),
    full_name,
    group_name,
    avg_grade: Number(avg_grade) || 0,
    skills,
    about,
    goal,
    rating,
    created_at: new Date().toISOString(),
    created_by
  };

  await db.read();
  db.data.students.push(student);
  await db.write();

  res.status(201).json(student);
});

app.delete('/api/students/:id', async (req, res) => {
  await db.read();
  const currentLength = db.data.students.length;
  db.data.students = db.data.students.filter((item) => item.id !== req.params.id);
  await db.write();

  if (db.data.students.length === currentLength) {
    return res.status(404).json({ message: 'Студент не найден' });
  }

  res.json({ message: 'Резюме удалено' });
});

app.get('/api/stats', async (req, res) => {
  await db.read();
  const { created_by } = req.query;
  const students = created_by
    ? db.data.students.filter((student) => student.created_by === created_by)
    : db.data.students || [];
  const specialties = {};

  students.forEach((student) => {
    const direction = getDirectionName(student.group_name);
    if (!specialties[direction]) {
      specialties[direction] = { name: direction, student_count: 0, total_rating: 0 };
    }
    specialties[direction].student_count += 1;
    specialties[direction].total_rating += Number(student.rating) || 0;
  });

  const specialtiesArray = Object.values(specialties).map((spec) => ({
    ...spec,
    avg_rating: spec.student_count ? (spec.total_rating / spec.student_count).toFixed(1) : '0.0'
  }));

  res.json({
    total_students: students.length,
    specialties: specialtiesArray
  });
});

app.listen(PORT, () => {
  console.log(`API запущен: http://localhost:${PORT}`);
});

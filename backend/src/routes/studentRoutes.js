const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { calculateRating } = require('../utils/rating');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { created_by } = req.query;

    let query = `SELECT * FROM students`;
    const values = [];

    if (created_by) {
      query += ` WHERE created_by = $1`;
      values.push(created_by);
    }

    query += ` ORDER BY created_at DESC`;

    const studentsResult = await pool.query(query, values);
    const students = studentsResult.rows;

    if (students.length === 0) {
      return res.json([]);
    }

    const ids = students.map((s) => s.id);

    const skillsResult = await pool.query(
      `SELECT student_id, skill_name
       FROM student_skills
       WHERE student_id = ANY($1::int[])`,
      [ids]
    );

    const skillsMap = {};
    skillsResult.rows.forEach((row) => {
      if (!skillsMap[row.student_id]) {
        skillsMap[row.student_id] = [];
      }
      skillsMap[row.student_id].push(row.skill_name);
    });

    const formattedStudents = students.map((student) => ({
      ...student,
      avg_grade: Number(student.avg_grade),
      rating: Number(student.rating),
      skills: skillsMap[student.id] || []
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('GET STUDENTS ERROR:', error);
    res.status(500).json({ message: 'Не удалось загрузить студентов' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const studentResult = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Резюме не найдено' });
    }

    const student = studentResult.rows[0];

    const skillsResult = await pool.query(
      'SELECT skill_name FROM student_skills WHERE student_id = $1',
      [id]
    );

    res.json({
      ...student,
      avg_grade: Number(student.avg_grade),
      rating: Number(student.rating),
      skills: skillsResult.rows.map((row) => row.skill_name)
    });
  } catch (error) {
    console.error('GET STUDENT ERROR:', error);
    res.status(500).json({ message: 'Ошибка получения резюме' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      full_name,
      group_name,
      avg_grade,
      skills = [],
      about,
      goal
    } = req.body;

    if (!full_name || !group_name || avg_grade === undefined || avg_grade === null) {
      return res.status(400).json({ message: 'Заполните обязательные поля' });
    }

    const rating = calculateRating(avg_grade, skills);

    await client.query('BEGIN');

    const studentResult = await client.query(
      `INSERT INTO students
       (full_name, group_name, avg_grade, about, goal, rating, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        full_name,
        group_name,
        avg_grade,
        about || '',
        goal || '',
        rating,
        req.user.id
      ]
    );

    const student = studentResult.rows[0];

    for (const skill of skills) {
      await client.query(
        `INSERT INTO student_skills (student_id, skill_name)
         VALUES ($1, $2)`,
        [student.id, skill]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...student,
      avg_grade: Number(student.avg_grade),
      rating: Number(student.rating),
      skills
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('CREATE STUDENT ERROR:', error);
    res.status(500).json({ message: 'Ошибка сохранения резюме' });
  } finally {
    client.release();
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Резюме не найдено' });
    }

    const student = result.rows[0];

    if (student.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на удаление этого резюме' });
    }

    await pool.query('DELETE FROM students WHERE id = $1', [id]);

    res.json({ message: 'Резюме удалено' });
  } catch (error) {
    console.error('DELETE STUDENT ERROR:', error);
    res.status(500).json({ message: 'Не удалось удалить резюме' });
  }
});

module.exports = router;
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

const getDirectionName = (group) => {
  if (!group) return 'Не указано';
  const cleanGroup = group.split(/[;,]/)[0].trim();

  if (cleanGroup.startsWith('П')) return 'Программирование';
  if (cleanGroup.startsWith('БАС')) return 'БАС';
  if (cleanGroup.startsWith('ИС')) return 'Информационные системы';
  if (cleanGroup.startsWith('Ю')) return 'Юриспруденция';
  if (cleanGroup.startsWith('Т')) return 'Тестировщики';
  if (cleanGroup.startsWith('Э')) return 'Электронщики';
  if (cleanGroup.startsWith('СА')) return 'Сетевое администрирование';
  if (cleanGroup.startsWith('БД')) return 'База данных';
  if (cleanGroup.startsWith('БИ')) return 'Бизнес-информатика';
  if (cleanGroup.startsWith('ВД')) return 'Веб-Дизайн';

  return 'Другое';
};

router.get('/', async (req, res) => {
  try {
    const { created_by } = req.query;

    let query = `SELECT * FROM students`;
    const values = [];

    if (created_by) {
      query += ` WHERE created_by = $1`;
      values.push(created_by);
    }

    const result = await pool.query(query, values);
    const students = result.rows;

    const specialtiesMap = {};

    students.forEach((student) => {
      const directionName = getDirectionName(student.group_name);

      if (!specialtiesMap[directionName]) {
        specialtiesMap[directionName] = {
          name: directionName,
          student_count: 0,
          total_rating: 0
        };
      }

      specialtiesMap[directionName].student_count += 1;
      specialtiesMap[directionName].total_rating += Number(student.rating);
    });

    const specialties = Object.values(specialtiesMap).map((item) => ({
      name: item.name,
      student_count: item.student_count,
      avg_rating: (item.total_rating / item.student_count).toFixed(1)
    }));

    res.json({
      total_students: students.length,
      specialties
    });
  } catch (error) {
    console.error('STATS ERROR:', error);
    res.status(500).json({ message: 'Не удалось получить статистику' });
  }
});

module.exports = router;
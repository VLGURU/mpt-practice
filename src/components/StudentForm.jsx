import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Badge, ProgressBar } from 'react-bootstrap';
import { FaPlus, FaMagic } from 'react-icons/fa';
import { GROUPS, SKILLS_BY_DIRECTION } from '../mocdata.js';

const StudentForm = ({ onAddStudent, calculateRating }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    group_name: '',
    avg_grade: 4.0,
    skills: [],
    about: '',
    goal: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [predictedRating, setPredictedRating] = useState(4.0);
  const [availableSkills, setAvailableSkills] = useState([]);

  const getDirection = (group) => {
    if (!group) return '';
    const cleanGroup = group.split(/[;,]/)[0].trim();

    if (cleanGroup.startsWith('П')) return 'П';
    if (cleanGroup.startsWith('БАС')) return 'БАС';
    if (cleanGroup.startsWith('ИС')) return 'ИС';
    if (cleanGroup.startsWith('Ю')) return 'Ю';
    if (cleanGroup.startsWith('Т')) return 'Т';
    if (cleanGroup.startsWith('Э')) return 'Э';
    if (cleanGroup.startsWith('СА')) return 'СА';
    if (cleanGroup.startsWith('БД')) return 'БД';
    if (cleanGroup.startsWith('БИ')) return 'БИ';
    if (cleanGroup.startsWith('ВД')) return 'ВД';
    if (cleanGroup.startsWith('ВТ')) return 'ВТ';

    return '';
  };

  const handleGroupChange = (group) => {
    setFormData({ ...formData, group_name: group });

    const direction = getDirection(group);
    if (direction && SKILLS_BY_DIRECTION[direction]) {
      setAvailableSkills(SKILLS_BY_DIRECTION[direction]);
    }

    calculateRating(formData.avg_grade, formData.skills);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...formData.skills, newSkill.trim()];
      setFormData({ ...formData, skills: updatedSkills });
      setNewSkill('');
      calculateRating(formData.avg_grade, updatedSkills);
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = formData.skills.filter((skill) => skill !== skillToRemove);
    setFormData({ ...formData, skills: updatedSkills });
    calculateRating(formData.avg_grade, updatedSkills);
  };

  const selectSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      const updatedSkills = [...formData.skills, skill];
      setFormData({ ...formData, skills: updatedSkills });
      calculateRating(formData.avg_grade, updatedSkills);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.group_name.trim()) {
      alert('Заполните ФИО и группу');
      return;
    }

    const student = {
      ...formData,
      avg_grade: parseFloat(formData.avg_grade),
      rating: calculateRating(formData.avg_grade, formData.skills),
    };

    onAddStudent(student);

    setFormData({
      full_name: '',
      group_name: '',
      avg_grade: 4.0,
      skills: [],
      about: '',
      goal: '',
    });
    setNewSkill('');
    setAvailableSkills([]);

    alert('✅ Резюме создано!');
  };

  useEffect(() => {
    const rating = calculateRating(formData.avg_grade, formData.skills);
    setPredictedRating(rating);
  }, [formData.avg_grade, formData.skills]);

  return (
    <Card className="shadow">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Создать резюме</h5>
      </Card.Header>

      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>ФИО *</Form.Label>
            <Form.Control
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Иванов Иван Иванович"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Группа *</Form.Label>
            <Form.Select value={formData.group_name} onChange={(e) => handleGroupChange(e.target.value)} required>
              <option value="">Выберите группу</option>
              {GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">Пример: П-1-24, БАС-1-24, ИС-1-24</Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>
              Средний балл: {formData.avg_grade.toFixed(1)}
              <span className="float-end text-primary">Рейтинг: {predictedRating.toFixed(1)}/5.0</span>
            </Form.Label>
            <Form.Range
              min="1"
              max="5"
              step="0.1"
              value={formData.avg_grade}
              onChange={(e) => setFormData({ ...formData, avg_grade: parseFloat(e.target.value) })}
            />
            <ProgressBar now={(formData.avg_grade / 5) * 100} variant="success" className="mt-2" />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Навыки</Form.Label>

            <div className="input-group mb-3">
              <Form.Control
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Добавьте навык..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button variant="outline-primary" onClick={addSkill}>
                <FaPlus /> Добавить
              </Button>
            </div>

            {availableSkills.length > 0 && (
              <div className="mb-3">
                <small className="text-muted">Рекомендуемые навыки:</small>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {availableSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      bg="light"
                      text="dark"
                      className="skill-badge"
                      onClick={() => selectSkill(skill)}
                      style={{ cursor: 'pointer' }}
                    >
                      {skill} +
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.skills.length > 0 && (
              <div>
                <small className="text-muted">Ваши навыки:</small>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} bg="info" className="d-flex align-items-center">
                      {skill}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        style={{ fontSize: '0.6rem' }}
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>О себе</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="Расскажите о себе..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Цель практики</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="Что хотите получить от практики?"
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" size="lg">
              Сохранить резюме
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setFormData({
                  full_name: 'Иванов Иван Иванович',
                  group_name: 'П-1-24',
                  avg_grade: 4.2,
                  skills: ['Python', 'HTML/CSS', 'Git'],
                  about: 'Студент техникума. Интересуюсь программированием.',
                  goal: 'Хочу получить опыт в IT-компании',
                });
                setAvailableSkills(SKILLS_BY_DIRECTION['П']);
              }}
            >
              <FaMagic className="me-2" />
              Заполнить пример
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default StudentForm;

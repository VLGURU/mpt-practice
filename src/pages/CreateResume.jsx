import React, { useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import StudentForm from '../components/StudentForm';
import { api } from '../services/api';
import { authStorage } from '../services/auth';

const CreateResume = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const calculateRating = (avgGrade, skills) => {
    const baseRating = parseFloat(avgGrade);
    const skillsBonus = skills.length * 0.1;
    return Math.min(5.0, baseRating + skillsBonus);
  };

  const handleAddStudent = async (studentData) => {
    try {
      setErrorMessage('');

      if (!authStorage.isAuthenticated()) {
        navigate('/auth');
        return;
      }

      await api.createStudent({
        ...studentData
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Не удалось сохранить резюме');
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 fw-bold">
            <i className="fas fa-user-plus me-3"></i>
            Создание резюме
          </h1>
          <p className="text-muted">Заполните форму для создания профессионального резюме студента</p>
        </Col>
      </Row>

      {!authStorage.isAuthenticated() && (
        <Alert variant="warning">
          Сначала войдите в систему для создания резюме.
        </Alert>
      )}

      {showSuccess && (
        <Alert variant="success" className="alert-dismissible fade show" onClose={() => setShowSuccess(false)} dismissible>
          <i className="fas fa-check-circle me-2"></i>
          Резюме успешно создано и сохранено в базе!
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" className="alert-dismissible fade show" onClose={() => setErrorMessage('')} dismissible>
          <i className="fas fa-exclamation-circle me-2"></i>
          {errorMessage}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <StudentForm onAddStudent={handleAddStudent} calculateRating={calculateRating} />
        </Col>

        <Col lg={4}>
          <div className="sticky-top" style={{ top: '20px' }}>
            <div className="card shadow mb-4">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-lightbulb me-2"></i>
                  Советы по заполнению
                </h6>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <strong>✅ ФИО полностью</strong>
                    <p className="text-muted small mb-0">Указывайте полное имя студента</p>
                  </li>
                  <li className="mb-3">
                    <strong>✅ Точная группа</strong>
                    <p className="text-muted small mb-0">Выберите группу из списка</p>
                  </li>
                  <li className="mb-3">
                    <strong>✅ Добавляйте навыки</strong>
                    <p className="text-muted small mb-0">Каждый навык повышает рейтинг</p>
                  </li>
                  <li>
                    <strong>✅ Опишите цель</strong>
                    <p className="text-muted small mb-0">Что студент хочет получить от практики</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card shadow">
              <div className="card-header bg-warning text-white">
                <h6 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Как рассчитывается рейтинг?
                </h6>
              </div>
              <div className="card-body">
                <p className="small mb-2">
                  <strong>Базовый рейтинг:</strong> равен среднему баллу
                </p>
                <p className="small mb-2">
                  <strong>Бонус за навыки:</strong> +0.1 за каждый навык
                </p>
                <p className="small mb-2">
                  <strong>Максимальный:</strong> 5.0 баллов
                </p>
                <hr className="my-2" />
                <p className="small text-muted mb-0">Рейтинг помогает работодателям быстро оценить потенциал студента</p>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateResume;
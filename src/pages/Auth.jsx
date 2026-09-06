import React, { useState } from 'react';
import { Card, Col, Row, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserLock, FaUserPlus } from 'react-icons/fa';
import { authStorage } from '../services/auth';

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await authStorage.register(formData);
      } else {
        await authStorage.login(formData);
      }

      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={6} xl={5}>
        <Card className="shadow border-0 glass-panel p-4">
          <Card.Body>
            <div className="text-center mb-4">
              <div className="icon-pill mb-3 mx-auto">
                {isRegister ? <FaUserPlus size={24} /> : <FaUserLock size={24} />}
              </div>
              <h3 className="fw-bold">{isRegister ? 'Регистрация' : 'Вход в систему'}</h3>
              <p className="text-muted">
                {isRegister
                  ? 'Создайте аккаунт для управления резюме.'
                  : 'Войдите, чтобы продолжить работу с резюме.'}
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {isRegister && (
                <Form.Group className="mb-3">
                  <Form.Label>ФИО</Form.Label>
                  <Form.Control
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Иванов Иван"
                    required
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@plehanov.ru"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button type="submit" variant="primary" size="lg">
                  {isRegister ? 'Создать аккаунт' : 'Войти'}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-4">
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setIsRegister((prev) => !prev)}
              >
                {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
              </button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Auth;
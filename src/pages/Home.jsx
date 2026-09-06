import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Button, Badge, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaFileAlt, FaChartLine, FaStar, FaRocket, FaGraduationCap } from 'react-icons/fa';
import { SPECIALTIES } from '../mocdata.js';
import { api } from '../services/api';
import { authStorage } from '../services/auth';

const Home = () => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    avgRating: 0,
    topSpecialties: SPECIALTIES.slice(0, 5)
  });
  const currentUser = authStorage.getCurrentUser();

  useEffect(() => {
    let active = true;
    const currentUser = authStorage.getCurrentUser();

    api
      .getStats(currentUser?.id)
      .then((data) => {
        if (!active) return;
        const avgRating = data.specialties && data.specialties.length
          ? (
              data.specialties.reduce((sum, item) => sum + Number(item.avg_rating || 0), 0) /
              data.specialties.length
            ).toFixed(1)
          : 0;
        setStats({
          totalResumes: data.total_students || 0,
          avgRating,
          topSpecialties: SPECIALTIES.slice(0, 5)
        });
      })
      .catch(() => {
        const saved = localStorage.getItem('students');
        const list = saved ? JSON.parse(saved) : [];
        const avgRating = list.length
          ? (list.reduce((sum, item) => sum + Number(item.rating || 0), 0) / list.length).toFixed(1)
          : 0;
        if (active) {
          setStats({
            totalResumes: list.length,
            avgRating,
            topSpecialties: SPECIALTIES.slice(0, 5)
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Container>
      <div className="gradient-banner mb-5 fade-in">
        <Row className="align-items-center">
          <Col lg={7} className="mb-4 mb-lg-0">
            <div className="hero-highlight mb-4">
              <span className="badge bg-light text-dark">Платформа практики Плеханова</span>
            </div>
            <h1 className="display-4 fw-bold mb-3">
              <FaGraduationCap className="me-3" />
              Витрина резюме для практики
            </h1>
            <p className="lead text-white-50 mb-4">
              Создавайте резюме, оценивайте сильные стороны и мгновенно готовьте документы для работодателей.
            </p>
            {currentUser && (
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Badge bg="light" text="dark" className="px-3 py-2">
                  Ваш аккаунт: {currentUser.fullName || currentUser.email}
                </Badge>
                <Badge bg="success" className="px-3 py-2">
                  Ваши резюме: {stats.totalResumes}
                </Badge>
              </div>
            )}
            <div className="d-flex flex-wrap gap-3">
              <Link to="/create">
                <Button variant="light" size="lg" className="px-4">
                  <FaFileAlt className="me-2" />
                  Создать резюме
                </Button>
              </Link>
              <Link to="/resumes">
                <Button variant="outline-light" size="lg" className="px-4">
                  <FaUserGraduate className="me-2" />
                  Все резюме
                </Button>
              </Link>
            </div>
          </Col>
          <Col lg={5} className="text-center">
            <div className="glass-panel p-4 floaty">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 className="text-dark mb-1">Индекс подготовки</h6>
                  <p className="text-muted mb-0">Оценка по 5-балльной шкале</p>
                </div>
                <div className="icon-pill">
                  <FaStar className="text-warning" size={22} />
                </div>
              </div>
              <h2 className="fw-bold text-primary">{stats.avgRating}/5.0</h2>
              <p className="text-muted">Средний рейтинг студентов в базе</p>
            </div>
          </Col>
        </Row>
      </div>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="shadow h-100 text-center fade-in">
            <Card.Body className="d-flex flex-column">
              <div
                className="stat-icon bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '70px', height: '70px' }}
              >
                <FaUserGraduate size={30} />
              </div>
              <h2 className="text-primary">{stats.totalResumes}</h2>
              <Card.Title>Создано резюме</Card.Title>
              <Card.Text className="text-muted">Студентов готовых к практике</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow h-100 text-center fade-in">
            <Card.Body className="d-flex flex-column">
              <div
                className="stat-icon bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '70px', height: '70px' }}
              >
                <FaStar size={30} />
              </div>
              <h2 className="text-success">{stats.avgRating}/5.0</h2>
              <Card.Title>Средний рейтинг</Card.Title>
              <Card.Text className="text-muted">Качество подготовленных резюме</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow h-100 text-center fade-in">
            <Card.Body className="d-flex flex-column">
              <div
                className="stat-icon bg-warning text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '70px', height: '70px' }}
              >
                <FaChartLine size={30} />
              </div>
              <h2 className="text-warning">{SPECIALTIES.length}</h2>
              <Card.Title>Направлений</Card.Title>
              <Card.Text className="text-muted">Различных специальностей</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow mb-5 fade-in">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">
            <FaRocket className="me-2" />
            Популярные направления
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {stats.topSpecialties.map((specialty) => (
              <Col md={6} lg={4} key={specialty.code} className="mb-3">
                <div className="d-flex align-items-center p-3 border rounded-4">
                  <Badge bg={specialty.color} className="me-3" style={{ fontSize: '1.1rem' }}>
                    {specialty.code}
                  </Badge>
                  <div>
                    <h6 className="mb-1">{specialty.name}</h6>
                    <small className="text-muted">Направление подготовки</small>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow fade-in">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <i className="fas fa-cogs me-2"></i>
            Как работает система
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div
                className="step-circle bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <span className="fs-4">1</span>
              </div>
              <h6>Создайте резюме</h6>
              <p className="text-muted small">Заполните информацию о студенте</p>
            </Col>

            <Col md={3} className="text-center mb-4">
              <div
                className="step-circle bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <span className="fs-4">2</span>
              </div>
              <h6>Система оценивает</h6>
              <p className="text-muted small">Автоматический расчет рейтинга</p>
            </Col>

            <Col md={3} className="text-center mb-4">
              <div
                className="step-circle bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <span className="fs-4">3</span>
              </div>
              <h6>Просматривайте</h6>
              <p className="text-muted small">Детальная информация о студенте</p>
            </Col>

            <Col md={3} className="text-center mb-4">
              <div
                className="step-circle bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <span className="fs-4">4</span>
              </div>
              <h6>Печать и отправка</h6>
              <p className="text-muted small">Готовое резюме для работодателя</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Home;

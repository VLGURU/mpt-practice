import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaTrash, FaPrint, FaGraduationCap, FaStar } from 'react-icons/fa';
import RatingStars from '../components/RatingStars';
import { SPECIALTIES } from '../mocdata.js';
import { api } from '../services/api';

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        const data = await api.getStudent(id);
        setStudent(data);
      } catch (error) {
        setErrorMessage(error.message || 'Резюме не найдено');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

  const getDirectionInfo = (groupName) => {
    if (!groupName) return { name: '', color: 'secondary' };

    const group = groupName.split(/[;,]/)[0].trim();
    let directionCode = '';

    if (group.startsWith('П')) directionCode = 'П';
    else if (group.startsWith('БАС')) directionCode = 'БАС';
    else if (group.startsWith('ИС')) directionCode = 'ИС';
    else if (group.startsWith('Ю')) directionCode = 'Ю';
    else if (group.startsWith('Т')) directionCode = 'Т';
    else if (group.startsWith('Э')) directionCode = 'Э';
    else if (group.startsWith('СА')) directionCode = 'СА';
    else if (group.startsWith('БД')) directionCode = 'БД';
    else if (group.startsWith('БИ')) directionCode = 'БИ';
    else if (group.startsWith('ВД')) directionCode = 'ВД';
    else if (group.startsWith('ВТ')) directionCode = 'ВТ';

    const specialty = SPECIALTIES.find((s) => s.code === directionCode);
    return {
      name: specialty ? specialty.name : 'Не указано',
      color: specialty ? specialty.color : 'secondary',
      code: directionCode,
    };
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить это резюме?')) {
      try {
        await api.deleteStudent(id);
        navigate('/resumes');
      } catch (error) {
        setErrorMessage(error.message || 'Не удалось удалить резюме');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container>
        <Alert variant="warning">
          <h4>Резюме не найдено</h4>
          <p>Запрошенное резюме не существует или было удалено.</p>
          <Link to="/resumes">
            <Button variant="primary">Вернуться к списку</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  const directionInfo = getDirectionInfo(student.group_name);
  const shortGroup = student.group_name.split(/[;,]/)[0].trim();

  return (
    <Container>
      {errorMessage && (
        <Alert variant="danger" className="mb-4">
          {errorMessage}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Link to="/resumes" className="text-decoration-none">
            <Button variant="outline-primary">
              <FaArrowLeft className="me-2" />
              Назад к списку
            </Button>
          </Link>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button variant="outline-warning">
              <FaEdit className="me-2" />
              Редактировать
            </Button>
            <Button variant="outline-danger" onClick={handleDelete}>
              <FaTrash className="me-2" />
              Удалить
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              <FaPrint className="me-2" />
              Печать
            </Button>
          </div>
        </Col>
      </Row>

      <Card className="shadow mb-4">
        <Card.Header className="bg-dark text-white">
          <Row className="align-items-center">
            <Col md={8}>
              <h2 className="mb-1">{student.full_name}</h2>
              <div className="d-flex align-items-center flex-wrap">
                <Badge bg="light" text="dark" className="fs-6 me-3 mb-2">
                  <FaGraduationCap className="me-1" />
                  Группа: {shortGroup}
                </Badge>
                <Badge bg={directionInfo.color} className="fs-6 me-3 mb-2">
                  {directionInfo.name}
                </Badge>
                <Badge bg="warning" text="dark" className="fs-6 mb-2">
                  <FaStar className="me-1" />
                  Рейтинг: {student.rating.toFixed(1)}/5.0
                </Badge>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="avatar-large">
                <span className="avatar-large-text">{student.full_name.split(' ').map((n) => n[0]).join('')}</span>
              </div>
            </Col>
          </Row>
        </Card.Header>
      </Card>

      <Row>
        <Col lg={8}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-tools me-2"></i>
                Профессиональные навыки
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                {student.skills && student.skills.length > 0 ? (
                  student.skills.map((skill, index) => (
                    <Badge key={index} bg="primary" className="skill-badge-large">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted mb-0">Навыки не указаны</p>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow mb-4">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                О себе
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="resume-text">{student.about || 'Информация о студенте не указана.'}</p>
            </Card.Body>
          </Card>

          <Card className="shadow mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-bullseye me-2"></i>
                Цель практики
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="resume-text">{student.goal || 'Цель практики не указана.'}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-warning text-white">
              <h5 className="mb-0">
                <FaStar className="me-2" />
                Рейтинг студента
              </h5>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-3">
                <RatingStars rating={student.rating} />
              </div>
              <h2 className="text-primary">{student.rating.toFixed(1)}</h2>
              <p className="text-muted small mb-2">из 5.0 возможных</p>

              <div className="mt-4">
                <p className="small mb-1">
                  <strong>Средний балл:</strong> {student.avg_grade}
                </p>
                <p className="small mb-1">
                  <strong>Навыков:</strong> {student.skills?.length || 0}
                </p>
                <p className="small mb-0">
                  <strong>Создано:</strong> {new Date(student.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow mb-4">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Контактная информация
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <p className="small text-muted mb-1">Учебное заведение</p>
                <p className="mb-0 fw-bold">Техникум</p>
              </div>

              <div className="mb-3">
                <p className="small text-muted mb-1">Группа</p>
                <p className="mb-0 fw-bold">{shortGroup}</p>
              </div>

              <div className="mb-3">
                <p className="small text-muted mb-1">Направле��ие</p>
                <Badge bg={directionInfo.color} className="fs-6">
                  {directionInfo.name}
                </Badge>
              </div>

              <div>
                <p className="small text-muted mb-1">Дата создания резюме</p>
                <p className="mb-0">
                  {new Date(student.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">Действия</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={handlePrint}>
                  <FaPrint className="me-2" />
                  Печать резюме
                </Button>
                <Button variant="outline-primary">
                  <i className="fas fa-envelope me-2"></i>
                  Отправить работодателю
                </Button>
                <Button variant="outline-secondary" as={Link} to="/resumes">
                  <FaArrowLeft className="me-2" />
                  Все резюме
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResumeDetail;
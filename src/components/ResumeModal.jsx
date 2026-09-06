import React, { useRef } from 'react';
import { Modal, Button, Container, Row, Col, Badge } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';
import { FaPrint, FaTimes, FaStar, FaGraduationCap } from 'react-icons/fa';
import RatingStars from './RatingStars';
import { SPECIALTIES } from '../mocdata.js';

const ResumeModal = ({ student, show, onHide }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Резюме_${student.full_name}_${student.group_name}`,
  });

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

  const direction = getDirection(student.group_name);
  const specialty = SPECIALTIES.find((s) => s.code === direction);
  const directionName = specialty ? specialty.name : direction;
  const directionColor = specialty ? specialty.color : 'secondary';

  const getShortGroup = (group) => {
    return group.split(/[;,]/)[0].trim();
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="resume-modal">
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>
          <FaGraduationCap className="me-2" />
          Резюме для практики
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <div className="text-end p-3 bg-light border-bottom">
          <Button variant="outline-primary" onClick={handlePrint} className="me-2">
            <FaPrint className="me-2" />
            Печать
          </Button>
        </div>

        <div ref={componentRef} className="p-4">
          <div
            className="resume-header text-white p-4 rounded mb-4"
            style={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            }}
          >
            <Row className="align-items-center">
              <Col md={8}>
                <h1 className="display-6 fw-bold">{student.full_name}</h1>
                <h4 className="mb-3">Техникум</h4>
                <div className="d-flex align-items-center mb-2 flex-wrap">
                  <Badge bg="light" text="dark" className="fs-6 me-3 mb-2">
                    <FaGraduationCap className="me-1" />
                    Группа: {getShortGroup(student.group_name)}
                  </Badge>
                  <Badge bg={directionColor} className="fs-6 me-3 mb-2">
                    Направление: {directionName}
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
          </div>

          <Container>
            <Row>
              <Col lg={6}>
                <div className="resume-section mb-4">
                  <h4 className="section-title">
                    <FaGraduationCap className="me-2" />
                    Академическая информация
                  </h4>
                  <div className="section-content">
                    <Row>
                      <Col md={6} className="mb-3">
                        <div className="info-card">
                          <div className="info-label">Учебное заведение</div>
                          <div className="info-value fw-bold">Техникум</div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="info-card">
                          <div className="info-label">Группа</div>
                          <div className="info-value fw-bold">{getShortGroup(student.group_name)}</div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="info-card">
                          <div className="info-label">Средний балл</div>
                          <div className="info-value">
                            <Badge bg="info" className="fs-6 px-3 py-2">
                              {student.avg_grade}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="info-card">
                          <div className="info-label">Рейтинг системы</div>
                          <div className="info-value">
                            <RatingStars rating={student.rating} />
                            <span className="ms-2 fw-bold">{student.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                <div className="resume-section mb-4">
                  <h4 className="section-title">
                    <i className="fas fa-tools me-2"></i>
                    Профессиональные навыки
                  </h4>
                  <div className="section-content">
                    <div className="d-flex flex-wrap gap-2">
                      {student.skills &&
                        student.skills.map((skill, index) => (
                          <Badge key={index} bg="primary" className="skill-badge-large" style={{ fontSize: '1rem', padding: '0.6em 1em' }}>
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </Col>

              <Col lg={6}>
                <div className="resume-section mb-4">
                  <h4 className="section-title">
                    <i className="fas fa-user me-2"></i>
                    О себе
                  </h4>
                  <div className="section-content">
                    <p className="resume-text">
                      {student.about ||
                        'Студент техникума, мотивированный к получению практического опыта в выбранной профессиональной области. Обладаю стремлением к постоянному развитию.'}
                    </p>
                  </div>
                </div>

                <div className="resume-section mb-4">
                  <h4 className="section-title">
                    <i className="fas fa-bullseye me-2"></i>
                    Цель практики
                  </h4>
                  <div className="section-content">
                    <p className="resume-text">
                      {student.goal ||
                        'Получить практический опыт в профессиональной сфере, применить теоретические знания на практике, развить профессиональные компетенции.'}
                    </p>
                  </div>
                </div>

                <div className="resume-section mb-4">
                  <h4 className="section-title">
                    <i className="fas fa-award me-2"></i>
                    Сильные стороны
                  </h4>
                  <div className="section-content">
                    <ul className="strengths-list">
                      {student.avg_grade >= 4.0 && <li>Высокий средний балл успеваемости ({student.avg_grade})</li>}
                      {student.skills && student.skills.length > 0 && <li>Наличие {student.skills.length} профессиональных навыков</li>}
                      <li>Студент техникума по направлению "{directionName}"</li>
                      <li>Готовность к профессиональному развитию и обучению</li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="text-center mt-5 pt-4 border-top">
              <div className="mb-3">
                <small className="text-muted">Резюме сгенерировано автоматически системой "Техникум Практика"</small>
              </div>
              <div>
                <small className="text-muted">Дата формирования: {new Date().toLocaleDateString('ru-RU')}</small>
              </div>
            </div>
          </Container>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <FaTimes className="me-2" />
          Закрыть
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <FaPrint className="me-2" />
          Печать резюме
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResumeModal;

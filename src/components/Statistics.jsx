import React from 'react';
import { Card, ProgressBar, Row, Col, Badge } from 'react-bootstrap';
import { FaChartLine, FaUsers, FaStar, FaGraduationCap } from 'react-icons/fa';
import { SPECIALTIES } from '../mocdata.js';

const Statistics = ({ data }) => {
  return (
    <Card className="shadow">
      <Card.Header className="bg-success text-white">
        <h6 className="mb-0">
          <FaChartLine className="me-2" />
          Статистика
        </h6>
      </Card.Header>

      <Card.Body>
        <Row className="mb-3">
          <Col xs={12} className="text-center mb-3">
            <div className="stat-item">
              <div
                className="stat-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '50px', height: '50px' }}
              >
                <FaUsers size={24} />
              </div>
              <div className="stat-value fw-bold fs-3">{data.total_students || 0}</div>
              <div className="stat-label text-muted">Всего резюме</div>
            </div>
          </Col>
        </Row>

        {data.specialties && data.specialties.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-3">
              <FaGraduationCap className="me-2" />
              По направлениям
            </h6>

            {data.specialties.map((spec) => {
              const specialty = SPECIALTIES.find((s) => s.name === spec.name);
              const color = specialty ? specialty.color : 'secondary';

              return (
                <div key={spec.name} className="group-item mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <span className="fw-bold">{spec.name}</span>
                      <small className="text-muted ms-2">({spec.student_count} чел.)</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge bg={color} className="me-2">
                        {spec.avg_rating}/5.0
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar now={(parseFloat(spec.avg_rating) / 5) * 100} variant={color} style={{ height: '8px' }} />
                </div>
              );
            })}
          </div>
        )}

        {data.specialties && data.specialties.length > 0 && (
          <>
            <hr />
            <div className="text-center">
              <h6 className="mb-2">
                <FaStar className="me-2 text-warning" />
                Средний рейтинг
              </h6>
              <div className="fs-2 fw-bold text-primary">
                {data.specialties.reduce((sum, spec) => sum + parseFloat(spec.avg_rating), 0) / data.specialties.length || 0}
                <span className="fs-6 text-muted">/5.0</span>
              </div>
            </div>
          </>
        )}
      </Card.Body>

      <Card.Footer className="bg-light">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Данные обновляются в реальном времени
        </small>
      </Card.Footer>
    </Card>
  );
};

export default Statistics;

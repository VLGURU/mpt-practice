import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import StudentList from '../components/StudentList';
import ResumeModal from '../components/ResumeModal';
import Statistics from '../components/Statistics';
import { api } from '../services/api';

const AllResumes = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statistics, setStatistics] = useState({
    total_students: 0,
    specialties: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [studentsData, statsData] = await Promise.all([api.getStudents(), api.getStats()]);
        setStudents(studentsData);
        setStatistics(statsData);
      } catch (error) {
        setErrorMessage(error.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [studentsData, statsData] = await Promise.all([api.getStudents(), api.getStats()]);
      setStudents(studentsData);
      setStatistics(statsData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это резюме?')) {
      try {
        await api.deleteStudent(id);
        await refreshData();
      } catch (error) {
        setErrorMessage(error.message || 'Не удалось удалить резюме');
      }
    }
  };

  const handleShowResume = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleImport = () => {
    handleRefresh();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'resumes_export.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="gradient-banner">
            <h1 className="display-5 fw-bold">
              <i className="fas fa-user-graduate me-3"></i>
              Все резюме студентов
            </h1>
            <p className="text-white-50 mb-4">Продвинутый фильтр, быстрый поиск и аналитика подготовки студентов</p>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="light" size="sm" onClick={handleRefresh}>
                <i className="fas fa-rotate me-2"></i>
                Обновить
              </Button>
              <Button variant="outline-light" size="sm" onClick={handleImport}>
                <i className="fas fa-download me-2"></i>
                Импорт
              </Button>
              <Button variant="outline-light" size="sm" onClick={handleExport} disabled={students.length === 0}>
                <i className="fas fa-upload me-2"></i>
                Экспорт
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" className="me-2" />
          <span className="text-white-50">Загружаем резюме...</span>
        </div>
      )}

      {errorMessage && (
        <Alert variant="danger" className="fade show">
          <i className="fas fa-exclamation-circle me-2"></i>
          {errorMessage}
        </Alert>
      )}

      <Row>
        <Col lg={9}>
          <StudentList students={students} onDelete={handleDelete} onShowResume={handleShowResume} />
        </Col>

        <Col lg={3}>
          <div className="sticky-top" style={{ top: '20px' }}>
            <Statistics data={statistics} />

            <div className="card shadow mt-4">
              <div className="card-header bg-dark text-white">
                <h6 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Информация
                </h6>
              </div>
              <div className="card-body">
                <p className="small">
                  <strong>Всего резюме:</strong> {students.length}
                </p>
                <p className="small">
                  <strong>Поиск работает по:</strong> ФИО, группе и навыкам
                </p>
                <p className="small mb-0">
                  <strong>Сортировка:</strong> по ФИО и рейтингу
                </p>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {selectedStudent && <ResumeModal student={selectedStudent} show={showModal} onHide={() => setShowModal(false)} />}
    </Container>
  );
};

export default AllResumes;

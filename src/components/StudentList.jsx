import React, { useMemo, useState, useEffect } from 'react';
import { Card, Table, Button, Badge, InputGroup, FormControl, Dropdown, Pagination, Form, Row, Col, Collapse } from 'react-bootstrap';
import { FaSearch, FaFilter, FaEye, FaTrash, FaSort, FaUserGraduate, FaMagic, FaTimes } from 'react-icons/fa';
import RatingStars from './RatingStars';
import { SPECIALTIES } from '../mocdata.js';

const StudentList = ({ students, onDelete, onShowResume }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [ratingRange, setRatingRange] = useState([1, 5]);
  const [gradeRange, setGradeRange] = useState([1, 5]);
  const [skillsFilter, setSkillsFilter] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const itemsPerPage = 10;

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

  const getDirectionColor = (direction) => {
    const specialty = SPECIALTIES.find((s) => s.code === direction);
    return specialty ? specialty.color : 'secondary';
  };

  const getDirectionName = (direction) => {
    const specialty = SPECIALTIES.find((s) => s.code === direction);
    return specialty ? specialty.name : direction;
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedSpecialty, ratingRange, gradeRange, skillsFilter]);

  const availableSkills = useMemo(() => {
    const skillSet = new Set();
    students.forEach((student) => {
      (student.skills || []).forEach((skill) => skillSet.add(skill));
    });
    return Array.from(skillSet).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setRatingRange([1, 5]);
    setGradeRange([1, 5]);
    setSkillsFilter([]);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredStudents = students.filter((student) => {
    if (selectedSpecialty !== 'all') {
      const direction = getDirection(student.group_name);
      if (direction !== selectedSpecialty) return false;
    }

    const ratingValue = Number(student.rating || 0);
    if (ratingValue < ratingRange[0] || ratingValue > ratingRange[1]) return false;

    const gradeValue = Number(student.avg_grade || 0);
    if (gradeValue < gradeRange[0] || gradeValue > gradeRange[1]) return false;

    if (skillsFilter.length > 0) {
      const studentSkills = (student.skills || []).map((skill) => skill.toLowerCase());
      const hasAllSkills = skillsFilter.every((skill) => studentSkills.includes(skill.toLowerCase()));
      if (!hasAllSkills) return false;
    }

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      return (
        student.full_name.toLowerCase().includes(term) ||
        student.group_name.toLowerCase().includes(term) ||
        (student.skills && student.skills.some((skill) => skill.toLowerCase().includes(term)))
      );
    }

    return true;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);

  const getShortGroup = (group) => {
    return group.split(/[;,]/)[0].trim();
  };

  return (
    <Card className="shadow">
      <Card.Header className="bg-dark text-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h5 className="mb-0">
            <FaUserGraduate className="me-2" />
            Все резюме ({students.length})
          </h5>

          <div className="d-flex flex-wrap gap-2">
            <InputGroup className="search-input">
              <FormControl placeholder="Поиск по ФИО, группе, навыкам..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <Button variant="outline-light" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </Button>
              )}
              <Button variant="outline-light">
                <FaSearch />
              </Button>
            </InputGroup>

            <Dropdown>
              <Dropdown.Toggle variant="outline-light">
                <FaFilter className="me-2" />
                Направления
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSelectedSpecialty('all')}>Все направления</Dropdown.Item>
                <Dropdown.Divider />
                {SPECIALTIES.map((specialty) => (
                  <Dropdown.Item key={specialty.code} onClick={() => setSelectedSpecialty(specialty.code)}>
                    <Badge bg={specialty.color} className="me-2">
                      {specialty.code}
                    </Badge>
                    {specialty.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Button variant={showAdvanced ? 'light' : 'outline-light'} onClick={() => setShowAdvanced((prev) => !prev)}>
              <FaMagic className="me-2" />
              Расширенный фильтр
            </Button>
          </div>
        </div>

        <Collapse in={showAdvanced}>
          <div className="mt-4 filter-panel">
            <Row className="g-3 align-items-end">
              <Col md={6} lg={3}>
                <Form.Label>Рейтинг</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Range min={1} max={5} step={0.1} value={ratingRange[0]} onChange={(e) => setRatingRange([Number(e.target.value), ratingRange[1]])} />
                  <Badge bg="info" className="px-3">{ratingRange[0].toFixed(1)}+</Badge>
                </div>
              </Col>
              <Col md={6} lg={3}>
                <Form.Label>Средний балл</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Range min={1} max={5} step={0.1} value={gradeRange[0]} onChange={(e) => setGradeRange([Number(e.target.value), gradeRange[1]])} />
                  <Badge bg="success" className="px-3">{gradeRange[0].toFixed(1)}+</Badge>
                </div>
              </Col>
              <Col md={12} lg={4}>
                <Form.Label>Навыки (совпадение всех)</Form.Label>
                <Form.Select value="" onChange={(e) => {
                  if (!e.target.value) return;
                  if (!skillsFilter.includes(e.target.value)) {
                    setSkillsFilter([...skillsFilter, e.target.value]);
                  }
                }}>
                  <option value="">Выберите навык</option>
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </Form.Select>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {skillsFilter.map((skill) => (
                    <Badge key={skill} bg="light" text="dark" className="skill-badge" onClick={() => setSkillsFilter(skillsFilter.filter((item) => item !== skill))}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </Col>
              <Col md={12} lg={2}>
                <Button variant="outline-light" className="w-100" onClick={clearFilters}>
                  Сбросить
                </Button>
              </Col>
            </Row>
          </div>
        </Collapse>
      </Card.Header>

      <Card.Body className="p-0">
        {sortedStudents.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="fas fa-user-graduate fa-4x text-muted"></i>
            </div>
            <h5 className="text-muted">Резюме не найдены</h5>
            <p className="text-muted">
              {debouncedSearch || selectedSpecialty !== 'all' || skillsFilter.length > 0 || ratingRange[0] > 1 || gradeRange[0] > 1
                ? 'Попробуйте изменить фильтры'
                : 'Создайте первое резюме'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '30%' }}>
                    <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => handleSort('full_name')}>
                      ФИО
                      <FaSort className="ms-1" style={{ fontSize: '0.8em' }} />
                    </div>
                  </th>
                  <th style={{ width: '15%' }}>Группа</th>
                  <th style={{ width: '15%' }}>Направление</th>
                  <th style={{ width: '15%' }}>
                    <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => handleSort('rating')}>
                      Рейтинг
                      <FaSort className="ms-1" style={{ fontSize: '0.8em' }} />
                    </div>
                  </th>
                  <th style={{ width: '15%' }}>Навыки</th>
                  <th style={{ width: '10%' }} className="text-center">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => {
                  const direction = getDirection(student.group_name);
                  const directionColor = getDirectionColor(direction);

                  return (
                    <tr key={student.id} className="align-middle">
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle me-3">
                            <span className="avatar-text">{student.full_name.split(' ').map((n) => n[0]).join('')}</span>
                          </div>
                          <div>
                            <div className="fw-bold">{student.full_name}</div>
                            <small className="text-muted">
                              <i className="fas fa-star text-warning me-1"></i>
                              Ср. балл: {student.avg_grade}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <Badge bg="secondary" className="group-badge">
                          {getShortGroup(student.group_name)}
                        </Badge>
                      </td>

                      <td>
                        <Badge bg={directionColor}>{getDirectionName(direction)}</Badge>
                      </td>

                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <RatingStars rating={student.rating} />
                          </div>
                          <Badge bg="info" className="rating-badge">
                            {student.rating.toFixed(1)}
                          </Badge>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {student.skills &&
                            student.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} bg="light" text="dark" className="skill-tag">
                                {skill.length > 12 ? skill.substring(0, 10) + '...' : skill}
                              </Badge>
                            ))}
                          {student.skills && student.skills.length > 3 && <Badge bg="secondary">+{student.skills.length - 3}</Badge>}
                        </div>
                      </td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button variant="outline-primary" size="sm" onClick={() => onShowResume(student)} title="Просмотреть">
                            <FaEye />
                          </Button>

                          <Button variant="outline-danger" size="sm" onClick={() => onDelete(student.id)} title="Удалить">
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {sortedStudents.length > 0 && (
        <Card.Footer className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Показано {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedStudents.length)} из {sortedStudents.length}
            </small>

            <Pagination className="mb-0">
              <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} />

              {[...Array(Math.min(5, totalPages))].map((_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}

              <Pagination.Next
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default StudentList;

import React from 'react';
import { Container, Navbar, Nav, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaUserPlus, FaFileAlt, FaHome, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { authStorage } from '../services/auth';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = authStorage.getCurrentUser();
  const isAuthenticated = authStorage.isAuthenticated();

  const handleLogout = () => {
    authStorage.logout();
    navigate('/');
    window.location.reload();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow main-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <FaGraduationCap className="me-2" />
          Техникум Практика
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <FaHome className="me-1" />
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/create">
              <FaUserPlus className="me-1" />
              Создать резюме
            </Nav.Link>
            <Nav.Link as={Link} to="/resumes">
              <FaFileAlt className="me-1" />
              Все резюме
            </Nav.Link>
          </Nav>

          {isAuthenticated && currentUser ? (
            <div className="d-flex align-items-center gap-2">
              <Badge bg="light" text="dark" className="d-flex align-items-center gap-1 px-3 py-2">
                <FaUserCircle />
                {currentUser.fullName || currentUser.email}
              </Badge>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                <FaSignOutAlt className="me-1" />
                Выйти
              </Button>
            </div>
          ) : (
            <Button variant="outline-light" size="sm" as={Link} to="/auth">
              Войти
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
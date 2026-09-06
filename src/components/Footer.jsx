import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto py-4">
      <Container>
        <Row>
          <Col md={6}>
            <h5>Техникум: Система практики</h5>
            <p className="mb-0 text-muted">
              Система для создания резюме студентов для производственной практики
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <small className="text-muted">© 2024 Техникум. Все права защищены.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;

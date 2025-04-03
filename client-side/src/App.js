import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card, Container, Modal, Form, Row, Col, Spinner, FloatingLabel } from "react-bootstrap";

function App() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load tất cả dữ liệu xe
  useEffect(() => {
    const fetchAllCars = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/cars`);
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCars();
  }, []);

  // Các hàm xử lý
  const handleEdit = (car) => setSelectedCar(car);
  const handleClose = () => setSelectedCar(null);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cars/${selectedCar._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedCar),
        }
      );
      
      const updatedCar = await response.json();
      setCars(cars.map(car => 
        car._id === updatedCar._id ? updatedCar : car
      ));
      handleClose();
    } catch (error) {
      console.error("Error saving car:", error);
    }
  };

  const handleChange = (e) => {
    setSelectedCar({
      ...selectedCar,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container className="p-4">
      <h1 className="text-center mb-4">Danh sách xe</h1>
      
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {cars.map((car) => (
            <Col key={car._id}>
              <Card className="h-100 shadow-sm border-0">
                <div className="ratio ratio-16x9">
                  <Card.Img 
                    variant="top" 
                    src={car.image || 'https://via.placeholder.com/300'} 
                    className="object-fit-cover"
                  />
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold">{car.name}</Card.Title>
                  <Card.Text className="text-muted">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-tag-fill me-2 text-primary"></i>
                      <span>{car.category}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-currency-dollar me-2 text-success"></i>
                      <span>{car.price.toLocaleString()} USD</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-building me-2 text-info"></i>
                      <span>{car.manufacturer}</span>
                    </div>
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    className="mt-auto align-self-start"
                    onClick={() => handleEdit(car)}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Chỉnh sửa
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal chỉnh sửa */}
      {selectedCar && (
        <Modal show onHide={handleClose} size="lg">
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">Chỉnh sửa thông tin xe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <div className="ratio ratio-16x9 mb-4">
                  <img 
                    src={selectedCar.image || 'https://via.placeholder.com/300'} 
                    className="img-fluid rounded object-fit-cover"
                    alt={selectedCar.name}
                  />
                </div>
              </Col>
              <Col md={6}>
                <Form>
                  <FloatingLabel controlId="floatingName" label="Tên xe" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="name" 
                      value={selectedCar.name} 
                      onChange={handleChange}
                      placeholder="Tên xe"
                    />
                  </FloatingLabel>

                  <FloatingLabel controlId="floatingCategory" label="Loại xe" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="category" 
                      value={selectedCar.category} 
                      onChange={handleChange}
                      placeholder="Loại xe"
                    />
                  </FloatingLabel>

                  <FloatingLabel controlId="floatingPrice" label="Giá (USD)" className="mb-3">
                    <Form.Control 
                      type="number" 
                      name="price" 
                      value={selectedCar.price} 
                      onChange={handleChange}
                      placeholder="Giá"
                    />
                  </FloatingLabel>

                  <FloatingLabel controlId="floatingManufacturer" label="Hãng sản xuất" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="manufacturer" 
                      value={selectedCar.manufacturer} 
                      onChange={handleChange}
                      placeholder="Hãng sản xuất"
                    />
                  </FloatingLabel>

                  <FloatingLabel controlId="floatingImage" label="URL ảnh xe" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="image" 
                      value={selectedCar.image} 
                      onChange={handleChange}
                      placeholder="URL ảnh"
                    />
                  </FloatingLabel>
                </Form>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={handleClose}>
              Hủy bỏ
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

export default App;
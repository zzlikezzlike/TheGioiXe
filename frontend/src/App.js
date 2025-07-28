import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card, Container, Modal, Form, Row, Col, Spinner, FloatingLabel, InputGroup } from "react-bootstrap";

function App() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newCar, setNewCar] = useState({
    name: '',
    category: '',
    price: '',
    manufacturer: '',
    image: '',
    _id: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    price: '',
    manufacturer: ''
  });

  // Load tất cả dữ liệu xe
  useEffect(() => {
    setLoading(true);
    const fetchAllCars = async () => {
      try {
        const response = await fetch('http://localhost:5000/');
        const data = await response.json();
        setCars(data);
        setFilteredCars(data); // Gán filteredCars là dữ liệu ban đầu
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCars();
  }, []);

  // Hàm tạo ID xe mới
  const generateUniqueId = (category, cars) => {
    if (!category) return "";

    const short = category.slice(0, 3).toUpperCase();
    const prefix = `CAR${short}`;

    const usedNumbers = cars
      .filter(car => car._id && car._id.startsWith(prefix))
      .map(car => {
        const numPart = car._id.slice(-4);
        return parseInt(numPart, 10);
      })
      .filter(num => !isNaN(num));

    const maxUsed = usedNumbers.length > 0 ? Math.max(...usedNumbers) : 0;
    const nextNumber = maxUsed + 1;
    const padded = nextNumber.toString().padStart(4, "0");

    return `${prefix}${padded}`;
  };

  // Hàm khi thay đổi loại xe (để tạo ID tự động)
  const handleCategoryChange = (e) => {
    const updatedCategory = e.target.value;
    const newId = generateUniqueId(updatedCategory, cars);
    setNewCar((prevCar) => ({
      ...prevCar,
      category: updatedCategory,
      _id: newId
    }));
  };

  // Hàm khi thay đổi thông tin xe mới
  const handleNewCarChange = (e) => {
    setNewCar({
      ...newCar,
      [e.target.name]: e.target.value
    });
  };

  // Hàm thêm xe mới
  const handleAddCar = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewCar({
      name: '',
      category: '',
      price: '',
      manufacturer: '',
      image: '',
      _id: ''
    });
  };

  const handleSaveNewCar = async () => {
  try {
    const formData = new FormData();
    formData.append('name', newCar.name);
    formData.append('category', newCar.category);
    formData.append('price', newCar.price);
    formData.append('manufacturer', newCar.manufacturer);

    // Nếu người dùng đã chọn ảnh
    if (newCar.image instanceof File) {
      formData.append('image', newCar.image);
    }

    const response = await fetch('http://localhost:5000/', {
      method: 'POST',
      body: formData,
    });

    const addedCar = await response.json();

    // ✅ Cập nhật lại danh sách ngay
    setCars((prev) => [...prev, addedCar]);
    setFilteredCars((prev) => [...prev, addedCar]); // Nếu bạn có filter

    // Đóng modal hoặc form thêm
    handleCloseAddModal();

  } catch (error) {
    console.error('Lỗi khi thêm xe:', error);
  }
};



  // Hàm chỉnh sửa xe
  const handleEdit = (car) => {
    setSelectedCar(car);
  };

  // Hàm lưu thay đổi sau khi chỉnh sửa
  const handleSave = async () => {
  try {
    const response = await fetch(`http://localhost:5000/${selectedCar._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedCar),
    });

    const updatedCar = await response.json();
    
    // Cập nhật lại cả cars và filteredCars
    setCars((prevCars) => 
      prevCars.map((car) => (car._id === updatedCar._id ? updatedCar : car))
    );
    setFilteredCars((prevFilteredCars) => 
      prevFilteredCars.map((car) => (car._id === updatedCar._id ? updatedCar : car))
    );

    handleClose();
  } catch (error) {
    console.error('Error saving edited car:', error);
  }
};


  // Hàm khi thay đổi thông tin xe khi chỉnh sửa
  const handleChange = (e) => {
    setSelectedCar({
      ...selectedCar,
      [e.target.name]: e.target.value,
    });
  };

  // Hàm đóng modal chỉnh sửa
  const handleClose = () => {
    setSelectedCar(null);
  };

  // Hàm xóa xe
  const handleDeleteCar = async (carId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa xe này?');
    if (confirmDelete) {
      try {
        await fetch(`http://localhost:5000/${carId}`, {
          method: 'DELETE',
        });
        setCars(cars.filter((car) => car._id !== carId));
        setFilteredCars(filteredCars.filter((car) => car._id !== carId));
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  };

  // Hàm tìm kiếm xe
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    filterCars(e.target.value, filters);
  };

  // Hàm lọc danh sách xe
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, [name]: value };
      filterCars(searchQuery, updatedFilters);
      return updatedFilters;
    });
  };

  // Hàm lọc danh sách xe theo tìm kiếm và bộ lọc
const filterCars = (query, filters) => {
  const lowercasedQuery = query.toLowerCase();

  setFilteredCars(
    cars.filter((car) => {
      // Chuẩn hóa giá trị lọc
      const categoryMatch = filters.category ? car.category.toLowerCase() === filters.category.toLowerCase() : true;
      const priceMatch = filters.price ? car.price <= filters.price : true;
      const manufacturerMatch = filters.manufacturer ? car.manufacturer.toLowerCase().includes(filters.manufacturer.toLowerCase()) : true;
      const searchMatch = car.name.toLowerCase().includes(lowercasedQuery) || car.category.toLowerCase().includes(lowercasedQuery) || car.manufacturer.toLowerCase().includes(lowercasedQuery);

      return categoryMatch && priceMatch && manufacturerMatch && searchMatch;
    })
  );
};
  

  return (
    <Container className="p-4">
      <h1 className="text-center mb-4">Danh sách xe</h1>

      <div className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm xe..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <Button variant="outline-secondary" onClick={() => filterCars(searchQuery, filters)}>
            Tìm kiếm
          </Button>
        </InputGroup>
      </div>

      <div className="mb-3">
        <Form.Control
          as="select"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          placeholder="Lọc theo loại xe"
        >
          <option value="">Tất cả loại xe</option>
          {/* Dùng các loại xe từ danh sách có sẵn hoặc trong dữ liệu */}
          <option value="SUV">SUV</option>
          <option value="Sedan">Sedan</option>
          <option value="Pickup">Pickup</option>
          <option value="Electric">Electric</option>
          {/* Thêm các loại xe khác */}
        </Form.Control>

        <Form.Control
          type="number"
          name="price"
          placeholder="Lọc theo giá"
          value={filters.price}
          onChange={handleFilterChange}
          className="mt-2"
        />

        <Form.Control
          type="text"
          name="manufacturer"
          placeholder="Lọc theo nhà sản xuất"
          value={filters.manufacturer}
          onChange={handleFilterChange}
          className="mt-2"
        />
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredCars.map((car) => (
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
                  <Button
                    variant="outline-danger"
                    className="mt-2 align-self-start"
                    onClick={() => handleDeleteCar(car._id)}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Xóa
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
                <FloatingLabel controlId="floatingId" label="ID xe (tự động)" className="mb-3">
                  <Form.Control
                    type="text"
                    name="_id"
                    value={selectedCar._id}
                    readOnly
                    placeholder="ID xe"
                  />
                </FloatingLabel>

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
                      value={newCar.image} 
                      onChange={handleNewCarChange}
                      placeholder="URL ảnh"
                    />
                  </FloatingLabel>

                  <Button variant="primary" className="w-100" onClick={handleSave}>
                    Lưu thay đổi
                  </Button>
                </Form>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      )}

      {/* Modal thêm xe */}
      <Button 
        variant="primary" 
        className="mt-4 w-100" 
        onClick={handleAddCar}
      >
        <i className="bi bi-plus-square me-2"></i>
        Thêm xe mới
      </Button>

      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm xe mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <FloatingLabel controlId="floatingId" label="ID xe (tự động)" className="mb-3">
              <Form.Control
                type="text"
                name="_id"
                value={newCar._id}
                readOnly
                placeholder="ID xe"
              />
            </FloatingLabel>

            <FloatingLabel controlId="floatingName" label="Tên xe" className="mb-3">
              <Form.Control
                type="text"
                name="name"
                value={newCar.name}
                onChange={handleNewCarChange}
                placeholder="Tên xe"
              />
            </FloatingLabel>

            <FloatingLabel controlId="floatingCategory" label="Loại xe" className="mb-3">
              <Form.Control
                type="text"
                name="category"
                value={newCar.category}
                onChange={handleCategoryChange}
                placeholder="Loại xe"
              />
            </FloatingLabel>

            <FloatingLabel controlId="floatingPrice" label="Giá (USD)" className="mb-3">
              <Form.Control
                type="number"
                name="price"
                value={newCar.price}
                onChange={handleNewCarChange}
                placeholder="Giá"
              />
            </FloatingLabel>

            <FloatingLabel controlId="floatingManufacturer" label="Nhà sản xuất" className="mb-3">
              <Form.Control
                type="text"
                name="manufacturer"
                value={newCar.manufacturer}
                onChange={handleNewCarChange}
                placeholder="Nhà sản xuất"
              />
            </FloatingLabel>

            
            <FloatingLabel controlId="floatingImage" label="URL ảnh xe" className="mb-3">
              <Form.Control 
                type="text" 
                name="image" 
                value={newCar.image}
                onChange={handleNewCarChange}
                placeholder="Nhập URL ảnh"
              />
            </FloatingLabel>


          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveNewCar}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;

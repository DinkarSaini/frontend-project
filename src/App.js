import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faCircleChevronRight, faAnglesRight, faCircleChevronLeft, faAnglesLeft } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function App() {
  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRow, setEditedRow] = useState({});
  const rowsPerPage = 10;

  const formatRole = (role) => {
    return capitalizeFirstLetter(role);
  }
  
  const dataAdmin = async () => {
    const res = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
    const data = await res.json();
    setAdminData(data);
    setFilteredData(data);
  };

  useEffect(() => {
    dataAdmin();
  }, []);

  useEffect(() => {
    const filteredResults = adminData.filter(
      (admin) =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filteredResults);
  }, [searchTerm, adminData]);


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const toggleRowSelection = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setEditedRow({ ...row });
  };

  const deleteRow = (id) => {
    setAdminData((prevData) => prevData.filter((admin) => admin.id !== id));
    setSelectedRows((prevSelectedRows) => prevSelectedRows.filter((rowId) => rowId !== id));
  };

  const saveEdit = (id) => {
    setAdminData((prevData) =>
      prevData.map((admin) => (admin.id === id ? { ...editedRow } : admin))
    );
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  
  const deleteSelectedRows = () => {
    setAdminData((prevData) => prevData.filter((admin) => !selectedRows.includes(admin.id)));
    setSelectedRows([]);
  };

  const toggleSelectAll = () => {
    setSelectAll((prevSelectAll) => !prevSelectAll);
    setSelectedRows(() =>
      selectAll
        ? []
        : currentRows.map((admin) => admin.id)
    );
  };

  const renderPageNumbers = () => {
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
      <div className="pagination">
        <Button variant="light" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          <FontAwesomeIcon icon={faAnglesLeft} />
        </Button>
        <Button variant="light" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <FontAwesomeIcon icon={faCircleChevronLeft} />
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant="light"
            onClick={() => handlePageChange(pageNumber)}
            disabled={currentPage === pageNumber}
            active={currentPage === pageNumber}
          >
            {pageNumber}
          </Button>
        ))}
        <Button variant="light" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <FontAwesomeIcon icon={faCircleChevronRight} />
        </Button>
        <Button variant="light" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          <FontAwesomeIcon icon={faAnglesRight} />
        </Button>
      </div>
    );
  };

  return (
    <div className="App">
      <Container>
        <form>
          <InputGroup className="my-5">
            <Form.Control
              placeholder="search by name, email or role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </form>
        <Table className="mt-3">
          <thead>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((admin) => (
              <tr key={admin.id} 
              style={{ backgroundColor: selectedRows.includes(admin.id) ? '#f1f' : 'inherit' }}
                onClick={() => toggleRowSelection(admin.id)}
              >
                <td>
                  <Form.Check
                    type="checkbox"
                    onChange={() => toggleRowSelection(admin.id)}
                    checked={selectedRows.includes(admin.id)}
                  />
                </td>
                <td>
                  {isEditing && editedRow.id === admin.id ? (
                    <Form.Control
                      type="text"
                      value={editedRow.name}
                      onChange={(e) => setEditedRow({ ...editedRow, name: e.target.value })}
                    />
                  ) : (
                    admin.name
                  )}
                </td>
                <td>
                  {isEditing && editedRow.id === admin.id ? (
                    <Form.Control
                      type="text"
                      value={editedRow.email}
                      onChange={(e) => setEditedRow({ ...editedRow, email: e.target.value })}
                    />
                  ) : (
                    admin.email
                  )}
                </td>
                <td>{formatRole(admin.role)}</td>
                <td>
                  {isEditing && editedRow.id === admin.id ? (
                    <>
                      <button onClick={() => saveEdit(admin.id)}>Save</button>{' '}
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleEdit(admin)}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                  )}
                  {' '}
                  <button onClick={() => deleteRow(admin.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className='delete'>
          <div>
            <Button variant="danger" onClick={deleteSelectedRows} disabled={selectedRows.length === 0}>
              Delete Selected
            </Button>
          </div>
          {renderPageNumbers()}
        </div>
      </Container>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import './Testing.css'

function Testing() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulating fetching data from an endpoint
    const fetchData = () => {
      const data = [
        {
          subject: 'Biology',
          links: [
            {
              link: 'http://www.biologylink1.com',
              description: 'This is link 1',
            },
            {
              link: 'http://www.biologylink2.com',
              description: 'This is link 2',
            },
          ],
        },
        {
          subject: 'Physics',
          links: [
            {
              link: 'http://www.physicslink1.com',
              description: 'This is link 1',
            },
            {
              link: 'http://www.physicslink2.com',
              description: 'This is link 2',
            },
            {
              link: 'http://www.physicslink3.com',
              description: 'This is link 3',
            },
          ],
        },
        {
          subject: 'Mathematics',
          links: [
            {
              link: 'http://www.mathematicslink1.com',
              description: 'This is link 1',
            },
          ],
        },
      ];
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <Container className="mt-5">
      <h1>Subjects and Links</h1>
      {data.map((subjectData, index) => (
        <SubjectTable key={index} subjectData={subjectData} />
      ))}
    </Container>
  );
}

function SubjectTable({ subjectData }) {
  return (
    <div className="mt-4">
      <h2>{subjectData.subject}</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Link</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {subjectData.links.map((linkData, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <a href={linkData.link} target="_blank" rel="noopener noreferrer">
                  {linkData.link}
                </a>
              </td>
              <td>{linkData.description}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Testing;

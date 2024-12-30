import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsonData from '../data.json';
import { useNavigate } from 'react-router-dom';

const Roadmap = () => {
  const [data] = useState(jsonData);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedCategory = localStorage.getItem('title');
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const categoryData = data[selectedCategory];

  if (!categoryData) {
    return <div>Category data for "{selectedCategory}" is not available.</div>;
  }

  const handleNext = async () => {
    try {
      const userName = localStorage.getItem('userName');
      const level = localStorage.getItem('level');

      if (!userName) {
        alert('User name is not available in localStorage');
        return;
      }

      const payload = {
        userName,
        level,
        categoryData
      };

      console.log('payload', payload)

      const response = await axios.post('http://localhost:3005/addLearningData', payload);

      if (response.status === 200) {
        alert('Data sent successfully!');
      } else {
        alert('Failed to send data');
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
      alert('An error occurred while sending data.');
    } finally {
      const name = localStorage.getItem('userName')
      navigate(`/learning?userName=${name}`);
    }
  };

  return (
    <div className="roadmap-container">
      <h2 className='main-topic'>{selectedCategory}</h2>
      <button onClick={handleNext}>Next</button>
      {Object.keys(categoryData).length === 0 ? (
        <p>No sections available for this category.</p>
      ) : (
        Object.keys(categoryData).map((section, sectionIndex) => (
          <div key={section}>
            <h3 className='main-heading'>{section}</h3>
            {Object.keys(categoryData[section]).map((subSection, subSectionIndex) => (
              <div key={subSection} className="sub-section">
                <h4 className='sub-heading'>{subSection}</h4>
                <div className="topics">
                  {Array.isArray(categoryData[section][subSection]) ? (
                    categoryData[section][subSection].map((topic, index) => (
                      <div
                        key={index}
                        className={`topic-item ${
                          (index + subSectionIndex) % 2 === 0 ? 'left' : 'right'
                        }`}
                      >
                        <p>{topic}</p>
                      </div>
                    ))
                  ) : (
                    <p>No topics available for this sub-section.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default Roadmap;
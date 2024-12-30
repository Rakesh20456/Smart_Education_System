import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LearningMaterial = () => {
  const [learningData, setLearningData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userName = params.get('userName');

    if (userName) {
      axios.get('http://localhost:3005/learning', { params: { userName: userName } })
        .then(response => {
          console.log(response.data.content)
          setLearningData(response.data.content);
        })
        .catch(error => {
          console.error('Error fetching learning data:', error);
        });
    }
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setSelectedSubTopic(null);
  };

  const handleSubTopicClick = (subTopic) => {
    setSelectedSubTopic(selectedSubTopic === subTopic ? null : subTopic);
  };

  const handleSubSubTopicClick = (subSubTopic) => {
    localStorage.setItem("selectedtopic", subSubTopic);
    if(localStorage.getItem(subSubTopic) == null){
      localStorage.setItem(subSubTopic, false);
    }
    navigate('/content');
  };

  return (
    <div className='learning-container'>
      {Object.entries(learningData).map(([category, subTopics]) => (
        <div key={category} className="category">
          <button onClick={() => handleCategoryClick(category)} className="topic-btn">
            {category}
          </button>

          {selectedCategory === category && (
            <div className="subtopics">
              <ul>
                {Object.entries(subTopics).map(([subTopic, details], index) => (
                  <li key={index}>
                    <button onClick={() => handleSubTopicClick(subTopic)} className="sub-topic-btn">
                      {subTopic}
                    </button>

                    {selectedSubTopic === subTopic && Array.isArray(details) && (
                      <ul className="sub-subtopics">
                        {details.map((item, idx) => (
                          <li key={idx}>
                            <button
                              onClick={() => handleSubSubTopicClick(item)}
                              className="sub-sub-topic-btn"
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LearningMaterial;
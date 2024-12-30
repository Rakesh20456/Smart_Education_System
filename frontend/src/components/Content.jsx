import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Content = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(''); // For specifying the target language
  const selectedTopic = localStorage.getItem('selectedtopic');

  const fetchfromdata = () => {
    axios.get('http://localhost:3005/generated-content', { params: { title: selectedTopic } })
      .then(response => {
        if (response.data && response.data.content) {
          setContent(response.data.content);
        } else {
          console.error("Content not found in the response.");
        }
      })
      .catch(error => {
        console.error('Error fetching content:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (selectedTopic) {
      setIsLoading(true);
      const generatedKey = selectedTopic;
      const generatedStatus = localStorage.getItem(generatedKey);

      if (generatedStatus === "false") {
        axios.post('http://localhost:5000/generate-content', { selectedTopic })
          .then(response => {
            const content = response.data.content;
            const title = selectedTopic;
            setContent(content);
            localStorage.setItem(generatedKey, true);

            axios.post('http://localhost:3005/store-generated-content', { title, content }, {
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then((res) => {
                console.log("Content saved to database:", res.data);
              })
              .catch((err) => {
                console.error("Error saving content to database:", err);
              });
          })
          .catch(error => {
            console.error('Error generating content:', error);
          })
          .finally(() => setIsLoading(false));
      } else {
        fetchfromdata();
      }
    } else {
      fetchfromdata();
    }
  }, [selectedTopic]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
    }
  };

  const handleTranslate = async () => {
    if (selectedText && targetLanguage) {
      try {
        const response = await axios.post('http://localhost:5000/translate', {
          text: selectedText,
          language: targetLanguage
        });
        setTranslatedText(response.data.translatedText);
      } catch (error) {
        console.error('Error translating text:', error);
      }
    }
  };

  const renderContent = () => {
    if (!content) return null;

    const lines = content.split('\n').map((line, index) => {
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return (
          <h2 key={index} className="header">
            {line.trim().replace(/\*\*/g, '')}
          </h2>
        );
      } else if (line.trim().startsWith('*')) {
        return (
          <li key={index} className="sub-content">
            {line.trim().replace(/\*/g, '')}
          </li>
        );
      } else {
        return (
          <p key={index} className="paragraph">
            {line.trim()}
          </p>
        );
      }
    });

    return (
      <div className="content-wrapper" onMouseUp={handleMouseUp}>
        {lines}
      </div>
    );
  };

  return (
    <div>
      {isLoading ? (
        <div className="loading-animation">
          Generating
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      ) : (
        renderContent()
      )}
      {selectedText && (
        <div style={{ marginTop: '20px' }}>
          <p>
            Selected Text: <strong>{selectedText}</strong>
          </p>
          <input
            type="text"
            placeholder="Enter target language code (e.g., fr, hi, es)"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          />
          <button onClick={handleTranslate}>Translate</button>
          {translatedText && (
            <p>
              Translated Text: <strong>{translatedText}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Content;
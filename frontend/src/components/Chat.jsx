import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faMicrophone, faUser } from '@fortawesome/free-solid-svg-icons';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchInitialQuestion();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchInitialQuestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: null }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = data.bot_response;
        setMessages([{ bot: botMessage, user: '' }]);
        speak(botMessage);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error fetching initial question:', error);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    setMessages((prev) => [...prev, { bot: '', user: userMessage }]);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = data.bot_response;
        setMessages((prev) => [...prev, { bot: botMessage, user: '' }]);
        speak(botMessage);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsRecording(true);

    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(speechResult);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const renderBotMessage = (message) => {
    const parts = message.split(/(\*\*Next question:\*\*|\*\*Suggestion for improvement:\*\*)/);
    return (
      <>
        {parts.map((part, index) => {
          if (part === '**Next question:**') {
            return <h4 key={index} style={{fontWeight:'500',margin:'10px'}}>Next question:</h4>;
          } else if (part === '**Suggestion for improvement:**') {
            return <h4 key={index} style={{fontWeight:'500',margin:'10px'}}>Suggestion for improvement:</h4>;
          } else {
            return <p key={index} className="mess">{part.trim()}</p>;
          }
        })}
      </>
    );
  };

  return (
    <div className="chat">
      <div className="chat-box">
        <div className="messages" id="messages">
          {messages.map((message, index) => (
            <div key={index}>
              {message.user && (
                <div className="message">
                  <div className="user-messages">
                    <div className="profile">
                      <FontAwesomeIcon icon={faUser} />
                      <p style={{ fontWeight: '600' }}>YOU</p>
                    </div>
                    <p className="mess">{message.user}</p>
                  </div>
                </div>
              )}
              {message.bot && (
                <div className="message">
                  <div className="bot-messages">
                    <div className="profile">
                      <FontAwesomeIcon icon={faRobot} />
                      <p style={{ fontWeight: '600' }}>BOT</p>
                    </div>
                    {renderBotMessage(message.bot)}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="loading-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Something..."
            autoFocus
            required
          />
          <button
            type="button"
            className="micro"
            onClick={handleMicClick}
            disabled={isRecording}
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
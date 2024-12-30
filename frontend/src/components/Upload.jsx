import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        navigate('/chat');
      } else {
        console.error('Resume upload failed');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
    }
  };

  return (
    <div className='Upload-container'>
      <h2>Upload Your Resume</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".pdf" />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default Upload;
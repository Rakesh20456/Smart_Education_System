import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Form = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userInput, setUserInput] = useState({
        name: '',
        topic: '',
        level: ''
    });    
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInput((prevInput) => ({
            ...prevInput,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        localStorage.removeItem('title');
        localStorage.removeItem('userName');
        localStorage.removeItem('level');

        if (userInput.topic.trim() === '' || userInput.level.trim() === '') {
            setLoading(false);
            setError('Please enter both language and topic.');
            return;
        }

        setTimeout(() => {
            setLoading(false);
        }, 3000)

        localStorage.setItem('title', userInput.topic);
        localStorage.setItem('userName', userInput.name);
        localStorage.setItem('level', userInput.level);

        navigate('/assessment');
    };

    return (
        <div>
            <div className="topic-selection">
                
                <form className="topics" onSubmit={handleSubmit}>
                    <input type="text" name='name' value={userInput.name} onChange={handleInputChange} placeholder='Enter your Name' />
                    <input type="text" name="topic" value={userInput.topic} onChange={handleInputChange} placeholder='Enter your Carrer Interest' list='programm'/>
                    <select name="level" value={userInput.level} onChange={handleInputChange}>
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Submit'}
                    </button>
                </form>
                {loading && (
                    <div className='load'>
                        Loading
                        <div className="dots">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}
                {error && <div className="error">{error}</div>}
            </div>
            <datalist id="programm">
                <option value="C"></option>
                <option value="C++"></option>
                <option value="Java"></option>
                <option value="Python"></option>
                <option value="JavaScript"></option>
                <option value="TypeScript"></option>
                <option value="Ruby"></option>
                <option value="Swift"></option>
                <option value="Rust"></option>
                <option value="PHP"></option>
                <option value="Kotlin"></option>
                <option value="R"></option>
                <option value="Matlab"></option>
                <option value="Julia"></option>
                <option value="Perl"></option>
                <option value="Objective-C"></option>
                <option value="Scala"></option>
                <option value="Haskell"></option>
                <option value="Shell"></option>
                <option value="SQL"></option>
                <option value="NoSQL"></option>
                <option value="HTML"></option>
                <option value="CSS"></option>
                <option value="Dart"></option>
                <option value="Machine Learning"></option>
                <option value="Artificial Intelligence"></option>
                <option value="Generative AI"></option>
                <option value="DS Data Science"></option>
                <option value="Neural Networks"></option>
                <option value="Deep Learning"></option>
                <option value="Natural Language Processing"></option>
                <option value="Computer Vision"></option>
                <option value="Reinforcement Learning"></option>
                <option value="Big Data"></option>
                <option value="Blockchain"></option>
                <option value="Internet of Things"></option>
                <option value="AR Augmented Reality"></option>
                <option value="VR Virtual Reality"></option>
                <option value="DevOps"></option>
                <option value="Cloud Computing"></option>
                <option value="AWS"></option>
                <option value="Azure"></option>
                <option value="Google Cloud"></option>
                <option value="Docker"></option>
                <option value="Kubernetes"></option>
                <option value="TensorFlow"></option>
                <option value="PyTorch"></option>
                <option value="Keras"></option>
                <option value="Pandas"></option>
                <option value="NumPy"></option>
                <option value="Scikit-Learn"></option>
                <option value="Matplotlib"></option>
                <option value="Seaborn"></option>
                <option value="Hadoop"></option>
                <option value="Spark"></option>
                <option value="Tableau"></option>
                <option value="Power BI"></option>
                <option value="Jupyter Notebooks"></option>
                <option value="Flask"></option>
                <option value="Django"></option>
                <option value="React"></option>
                <option value="Vue.js"></option>
                <option value="Angular"></option>
                <option value="Node.js"></option>
                <option value="Express.js"></option>
                <option value="Selenium"></option>
                <option value="Git"></option>
                <option value="GitHub"></option>
            </datalist>

        </div>
    );
};

export default Form;
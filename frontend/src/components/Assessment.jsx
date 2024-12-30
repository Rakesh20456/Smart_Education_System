import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mcqData from '../mcqs.json'

const Assessment = () => {
    const [mock, setMock] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const navigate = useNavigate();
    const title = localStorage.getItem("title");
    
    useEffect(() => {
        if (title && mcqData[title]) {
            const questionsWithIds = mcqData[title].map((mcq, index) => ({
                id: index,
                question: mcq.question,
                options: mcq.options,
                correct_answer: mcq.answer
            }));
            setMock(questionsWithIds);
        }
    }, []);    

    const handleAnswerChange = (questionId, selectedOption, optionText) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: {
                index: selectedOption,
                text: optionText
            }
        }));
    };

    const handleSubmit = () => {
        if (!mock.every(mcq => selectedAnswers[mcq.id])) {
            alert('Please answer all questions');
            return;
        }

        const evaluatedResults = mock.map(mcq => {
            const userAnswer = selectedAnswers[mcq.id].text;
            const isCorrect = userAnswer === mcq.correct_answer;

            return {
                ...mcq,
                user_answer_text: userAnswer,
                is_correct: isCorrect
            };
        });

        const correctCount = evaluatedResults.filter(result => result.is_correct).length;
        setScore(correctCount);
        setEvaluationResult({ evaluations: evaluatedResults });
        setSubmitted(true);
    };

    if (mock.length === 0) {
        return <div>Loading questions or no questions available for this topic...</div>;
    }

    return (
        <div className="c-container">
            <div className="head">
                <h4 className="c-head">{title} MCQ Assessment</h4>
            </div>

            {submitted && (<div className="success-container">
                    <div className="success">
                        Successfully Submitted!
                    </div>
                    <div className="loading">
                        <div className="loader"></div>
                    </div>
                </div>)}

                <div id="mcqsresult">
                    {evaluationResult ? (
                    <div>
                        {evaluationResult.evaluations.map((evalData, index) => (
                            <div 
                                className={`mcqs ${evalData.is_correct ? 'correct-answer' : 'incorrect-answer'}`} 
                                key={index}
                            >
                                <h2 className="questions">{evalData.question}</h2>
                                
                                {evalData.options.map((option, idx) => (
                                    <p key={idx} className={evalData.user_answer_text === option ? 'selected-answer' : ''}>
                                        {option}
                                    </p>
                                ))}
                                
                                <p className="user-answer">
                                    <b>Your Answer: </b>
                                    {evalData.user_answer_text}
                                </p>
                                <p className="correct-answer">
                                    <b>Correct Answer: </b>
                                    {evalData.correct_answer}
                                </p>
                                <p className={evalData.is_correct ? 'correct' : 'incorrect'}>
                                    {evalData.is_correct ? 'Correct' : 'Incorrect'}
                                </p>
                            </div>
                        ))}
                        <div className="feedback">
                            <h3 className='feedbackheading'>Result:</h3>
                            <p>Your score is {score} out of {mock.length}.</p>
                        </div>
                    </div>
                ) : (
                    mock.map(data => (
                        <div className="mcqs" key={data.id}>
                            <h2>{data.question}</h2>
                            {data.options.map((option, idx) => (
                                <label key={idx} className="option-label">
                                    <input
                                        type="radio"
                                        name={`question-${data.id}`}
                                        value={idx}
                                        checked={selectedAnswers[data.id]?.index === idx.toString()}
                                        onChange={() => handleAnswerChange(data.id, idx.toString(), option)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    ))
                )}

                        </div>
                        <div className="footer">
                    {!submitted && mock.length > 0 && (
                        <button onClick={handleSubmit} className="submits">
                            Submit
                        </button>
                    )}

                    {submitted && (
                        <button onClick={() => navigate('/road-map')} className="roadmap">
                            Generate RoadMap
                        </button>
                    )}
                </div>


        </div>
    );
};

export default Assessment;
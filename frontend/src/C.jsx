import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const C = () => {
    const [mock, setMock] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [feedbacks, setFeedbacks] = useState("");
    const [loading, setLoading] = useState(false);
    const [submmited, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const navigate = useNavigate();
    
    useEffect(() => {
        const mcqs = localStorage.getItem('mcq');
        const evaluate = localStorage.getItem('evaluation');
        if (mcqs) {
            const parsedMcqs = JSON.parse(mcqs);
            console.log('Parsed MCQs:', parsedMcqs);

            const questionsWithIds = parsedMcqs.map((mcq, index) => ({
                id: index,
                question: mcq.question,
                options: mcq.options,
                code: mcq.code
            }));

            setMock(questionsWithIds);
        }
        if(evaluate){
            const parsedMcqs = JSON.parse(evaluate);
            console.log("Evaluations:",parsedMcqs);
            setEvaluationResult(parsedMcqs);
            let correctAnswersCount = 0;
            parsedMcqs.evaluations.forEach((evalData) => {
                if (evalData.user_answer === evalData.correct_answer) {
                    correctAnswersCount++;
                }
            });
    
            setScore(correctAnswersCount);
        }
    }, []);    

    const handleNext = () => {
        localStorage.removeItem('mcq');
        navigate('/');
    }

    const generatePDF = () => {
        const input = document.getElementById('mcqsresult');
        if (!input) {
            console.error('Element with id "mcqsresult" not found.');
            return;
        }
        
        html2canvas(input, { scale: 2 })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: [210, 297]
                });
                pdf.addImage(imgData, 'PNG', 10, 10, 190, (canvas.height * 190 / canvas.width));
                pdf.save('MCQ.pdf');
            })
            .catch(error => {
                console.error('Error generating PDF:', error);
            });
    };
  
    const handleAnswerChange = (questionId, selectedOption) => {
        setSelectedAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: selectedOption
        }));
    };

    const handleSubmit = async () => {
        const allAnswered = mock.every((mcq) => selectedAnswers[mcq.id] !== undefined);
    
        if (!allAnswered) {
            alert('Please answer all the MCQs before submitting.');
            return;
        }
    
        const formattedMcqs = mock.map(mcq => ({
            question: mcq.question,
            code: mcq.code,
            options: mcq.options,
            selectedAnswer: selectedAnswers[mcq.id] || "Not answered"
        }));
        setLoading(true);
        setSubmitted(true);
    
        try {
            const response = await fetch('http://localhost:5000/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mcqs: formattedMcqs })
            });
    
            const result = await response.json();
            console.log("Result", result.evaluation);
            setEvaluationResult(result.evaluation);
            setFeedbacks(result.evaluation.feedback);
    
            let points = 0;
            result.evaluation.evaluations.forEach((evalData) => {
                if (evalData.user_answer === evalData.correct_answer) {
                    points++;
                }
            });
    
            setScore(points);
            setLoading(false);
            setTimeout(() => {
                setSubmitted(false);
            }, 2000);
            localStorage.removeItem('mcq');
            localStorage.setItem('evaluation', JSON.stringify(result.evaluation));
            const email = localStorage.getItem('userEmail');
            const programming = JSON.parse(localStorage.getItem('plang'));
            axios.post('http://localhost:3005/mcqdata',{email, programming, points})
            .then(result => {
                console.log(result.data);
            })
            .catch(err => console.log(err)); 
        } catch (error) {
            console.log('Error:', error);
            setLoading(false);
        }
    };    

    return (
        <div>
            <div className="c-container">
                <div className="head">
                    <p className='c-head'>MCQ'S Test</p>
                    <p>* Instruction: Choose the correct answers for all questions. After finishing the MCQ's test you can take the print as pdf.</p>
                </div>
                {submmited && (<div className="success-container">
                    <div className="success">
                        Successfully Submitted!
                    </div>
                    <div className="loading">
                        <div className="loader"></div>
                    </div>
                </div>)}
                
                {(mock.length > 0 || (evaluationResult && evaluationResult.evaluations.length > 0)) ? (<button onClick={generatePDF}>Print</button>) : (<p className='no-mcq'>No Mcq's Generated</p>)}
                <div id='mcqsresult'>
                    {evaluationResult ? (
                        <div>
                            {evaluationResult.evaluations.map((evalData, index) => (
                                <div className="mcqs" key={index}>
                                    <h2>{evalData.question}</h2>
                                    <p className='codes'>{evalData.code}</p>
                                    {evalData.options.map((option, idx) => (
                                        <p key={idx}>{option}</p>
                                    ))}
                                    <p className="user-answer"><b>Your Answer: </b>{evalData.user_answer}</p>
                                    <p className="correct-answer"><b>Correct Answer: </b>{evalData.correct_answer}</p>
                                </div>
                            ))}
                            <div className="feedback">
                                <h3>Result:</h3>
                                <p>Your score is {score} out of {evaluationResult.evaluations.length}.</p>
                            </div>
                        </div>
                    ) : (
                        mock.map((data) => (
                            <div className="mcqs" key={data.id}>
                                <h2>{data.question}</h2>
                                <p className='codes'>{data.code}</p>
                                {Object.entries(data.options).map(([key, value]) => (
                                    <p key={key}>
                                        <input
                                            type="radio"
                                            name={`question-${data.id}`}
                                            value={key}
                                            checked={selectedAnswers[data.id] === key}
                                            onChange={() => handleAnswerChange(data.id, key)}
                                        />
                                        {value}
                                    </p>
                                ))}
                            </div>
                        ))
                    )}
                </div>
                {mock.length > 0 ? (<button onClick={handleSubmit} disabled={evaluationResult || loading} className='submits'>
                    Submit
                    {loading && (
                        <div className='load'>
                            <div className="dots">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                </button>) : ('') }
                <button onClick={handleNext}>Next</button>
            </div>
        </div>
    );
};

export default C;
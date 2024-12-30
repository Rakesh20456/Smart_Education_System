import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [mcqs, setMcqs] = useState(0);
  const [points, setPoints] = useState(0);
  const [mock, setMock] = useState(0);

  useEffect(() => {
    const querParams = new URLSearchParams(window.location.search);
    const email = querParams.get('email');
    axios.get('http://localhost:3005/getData', {params : {email: email}})
      .then(result => {
        console.log(result.data)
        setUser(result.data)
      })
      .catch(err => console.log(err));
  }, []);

  const animateValue = (start, end, duration, setValue) => {
    if (start === end) return;
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      setValue(current);
      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);
  };

  useEffect(() => {
    if (user.mcqs !== undefined) {
      animateValue(0, user.mcqs, 2000, setMcqs);
    }
  }, [user.mcqs]);

  useEffect(() => {
    if (user.points !== undefined) {
      animateValue(0, user.points, 2000, setPoints);
    }
  }, [user.points]);

  useEffect(() => {
    if (user.mock !== undefined) {
      animateValue(0, user.mock, 2000, setMock);
    }
  }, [user.mock]);

  const chartData = {
    labels: user.programs ? user.programs.map(program => program.programming) : [],
    datasets: [
      {
        label: 'Count of MCQs',
        data: user.programs ? user.programs.map(program => program.count) : [],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgb(53, 53, 53, 0.8)',
      },
    },
    elements: {
      point: {
        radius: 6,
      },
      line: {
        backgroundColor: 'white',
        borderColor: 'rgba(75, 192, 192)',
        borderWidth: 4,
      },
    },
    layout: {
      padding: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10,
      },
    },
  };
  

  return (
    <div>
      <div className="dashboard-container">
        <div className="small-container">
          <div className="profile">
              <p><b>Name: </b>{user.name}</p>
              <p><b>Email: </b>{user.email}</p>
          </div>
          <div className="mcqs-container">
              <h2>Total Mcq's Test</h2>
              <p>{user.mcqs !== undefined ? mcqs : 'Loading...'} +</p>
          </div>
          <div className="points-container">
            <h2>Total Points</h2>
            <p>{user.points !== undefined ? points : 'Loading...'} +</p>
          </div>
        </div>
          
          <div className="mock-graph">
            <div className="mock-containers">
              <h2>Total Mock Interview</h2>
              <p>{user.points !== undefined ? mock : 'Loading...'} +</p>
            </div>
            <div className="graph-container">
              <h2 style={{textAlign:'center'}}>MCQ's</h2>
              <Line data={chartData} options={chartOptions} className='graph'/>
            </div>
          </div>
          <div className="programming-container">
            <h2>Programming Languages</h2>
            <table>
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {user.programs && user.programs.length > 0 ? (
                  user.programs.map((program, index) => (
                    <tr key={index}>
                      <td>{program.programming}</td>
                      <td>{program.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">Loading...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>          
        </div>    
    </div>
  );
}

export default Dashboard;
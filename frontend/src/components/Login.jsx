import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [login, setLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = () => {
        setLogin(false);
    };

    const handleLogin = () => {
        setLogin(true);
    };

    const handleSign = () => {
        axios.post('http://localhost:3005/getSignup', { name, email, password })
            .then(result => {
                console.log(result);
                setLogin(true);
            })
            .catch(err => console.log(err));
    };

    const handleLog = () => {
        axios.post('http://localhost:3005/getLogin', { email, password })
            .then(result => {
                console.log(result);
                if (result.data === "Success") {
                    localStorage.setItem("isLoggedIn", true);
                    localStorage.setItem("userEmail", email);
                    navigate(`/dashboard?email=${email}`);
                } else {
                    console.log(result.data);
                }
            })
            .catch(err => console.log(err));
    };      

    return (
        <div>
            <div className="login-container">
                {login ? (
                    <div className="inputs">
                        <h3>Login</h3>
                        <input
                            type="text"
                            placeholder='Email'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder='Password'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button onClick={handleLog}>Login</button>
                        <p onClick={handleSignup}>Don't have an account? SignUp</p>
                    </div>
                ) : (
                    <div className="inputs">
                        <h3>SignUp</h3>
                        <input
                            type="text"
                            placeholder='Name'
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder='Email'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder='Password'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button onClick={handleSign}>Signup</button>
                        <p onClick={handleLogin}>Already have an account? Login</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import './App.css';

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Function to handle login form submission
    const handleLogin = (e) => {
        e.preventDefault();
        // Simple validation (you can add more complex validation)
        if (!email || !password) {
            setErrorMessage('Please enter both email and password.');
        } else {
            // For now, just log the email and password (you can add authentication logic)
            console.log(`Email: ${email}, Password: ${password}`);
            setErrorMessage('');
            alert('Logged in successfully!');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default App;

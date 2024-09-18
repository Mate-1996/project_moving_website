import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './App.css';
import { auth } from './FirebaseConfig'; // Import Firebase Auth


function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [message, setMessage] = useState('');

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            alert('Logged in successfully!');
            console.log('User:', userCredential.user);
        } catch (error) {
            setErrorMessage('Login failed. Check your credentials.');
            console.error('Login Error:', error);
        }
    };

    // Handle forgot password
    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMessage('Please enter your email.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage(`A password reset email has been sent to ${email}`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Error sending reset email.');
            console.error('Reset Error:', error);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {message && <p className="success-message">{message}</p>}
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

            <button className="forgot-password" onClick={handleForgotPassword}>
                Forgot Password?
            </button>
        </div>
    );
}

export default App;


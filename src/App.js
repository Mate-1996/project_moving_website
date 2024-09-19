import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './FirebaseConfig'; // Firebase config file
import { useNavigate } from 'react-router-dom'; // For redirecting after login/signup
import './App.css'; // Your custom CSS for the form

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false); // Toggle between login and sign up
    const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle for forgot password
    const navigate = useNavigate(); // Used for navigating between routes

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setSuccessMessage(`Logged in successfully as ${userCredential.user.email}`);
            navigate('/home'); // Redirect to home page after login
        } catch (error) {
            setErrorMessage("Login failed. Please check your credentials.");
        }
    };

    // Handle sign up
    const handleSignUp = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setSuccessMessage(`Account created successfully for ${userCredential.user.email}`);
            navigate('/home'); // Redirect to home page after sign-up
        } catch (error) {
            setErrorMessage("Failed to create account. Please try again.");
        }
    };

    // Handle forgot password
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Password reset email sent! Please check your inbox.');
        } catch (error) {
            setErrorMessage('Failed to send password reset email. Please check your email address.');
        }
    };

    return (
        <div className="login-container">
            <h1>Centori Moving</h1>
            <h2>{isSigningUp ? "Sign Up" : showForgotPassword ? "Reset Password" : "Login"}</h2>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {/* Show reset password form */}
            {showForgotPassword ? (
                <form onSubmit={handleForgotPassword}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Send Password Reset Email</button>
                    <button onClick={() => setShowForgotPassword(false)}>Back to Login</button>
                </form>
            ) : (
                <form onSubmit={isSigningUp ? handleSignUp : handleLogin}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {!isSigningUp && (
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <button type="submit">{isSigningUp ? "Sign Up" : "Login"}</button>
                </form>
            )}

            {/* Toggle between login and sign-up */}
            {!showForgotPassword && (
                <>
                    <button onClick={() => setIsSigningUp(!isSigningUp)}>
                        {isSigningUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                    </button>
                    <button onClick={() => setShowForgotPassword(true)}>Forgot Password?</button>
                </>
            )}
        </div>
    );
}

export default App;





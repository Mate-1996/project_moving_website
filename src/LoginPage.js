// import React, { useState } from 'react';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
// import { auth } from './firebaseConfig'; // Firebase config file
// import { useNavigate } from 'react-router-dom'; // For redirecting after login/signup
// import './LoginPage.css'; // Your custom CSS for the form

// function App() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');
//     const [isSigningUp, setIsSigningUp] = useState(false); // Toggle between login and sign up
//     const [resetEmail, setResetEmail] = useState(''); // State for reset email
//     const [showReset, setShowReset] = useState(false); // State to show reset password
//     const navigate = useNavigate(); // Used for navigating between routes

//     // Handle login
//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setErrorMessage('');
//         setSuccessMessage('');
//         try {
//             const userCredential = await signInWithEmailAndPassword(auth, email, password);
//             setSuccessMessage(`Logged in successfully as ${userCredential.user.email}`);
//             navigate('/home'); // Redirect to home page after login
//             // Clear email and password fields
//             setEmail('');
//             setPassword('');
//         } catch (error) {
//             setErrorMessage("Login failed. Please check your credentials.");
//         }
//     };

//     // Handle sign up
//     const handleSignUp = async (e) => {
//         e.preventDefault();
//         setErrorMessage('');
//         setSuccessMessage('');
//         try {
//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             setSuccessMessage(`Account created successfully for ${userCredential.user.email}`);
//             navigate('/home'); // Redirect to home page after sign-up
//             // Clear email and password fields
//             setEmail('');
//             setPassword('');
//         } catch (error) {
//             setErrorMessage("Failed to create account. Please try again.");
//         }
//     };

//     // Handle password reset
//     const handlePasswordReset = async (e) => {
//         e.preventDefault();
//         setErrorMessage('');
//         setSuccessMessage('');
//         try {
//             await sendPasswordResetEmail(auth, resetEmail);
//             setSuccessMessage('Reset email sent successfully! Check your inbox.');
//             setResetEmail(''); // Clear reset email field
//             setShowReset(false); // Hide reset password form
//         } catch (error) {
//             setErrorMessage('Failed to send reset email. Please try again.');
//         }
//     };

//     return (
//         <div className="login-container">
//             <h1>Centori Moving</h1>
//             <h2>{isSigningUp ? "Sign Up" : "Login"}</h2>

//             {errorMessage && <p className="error-message">{errorMessage}</p>}
//             {successMessage && <p className="success-message">{successMessage}</p>}

//             {showReset ? (
//                 <form onSubmit={handlePasswordReset}>
//                     <div className="form-group">
//                         <label>Enter your email:</label>
//                         <input
//                             type="email"
//                             value={resetEmail}
//                             onChange={(e) => setResetEmail(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <button type="submit">Send Reset Email</button>
//                     <button type="button" onClick={() => setShowReset(false)}>Back to Login</button>
//                 </form>
//             ) : (
//                 <form onSubmit={isSigningUp ? handleSignUp : handleLogin}>
//                     <div className="form-group">
//                         <label>Email:</label>
//                         <input
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <div className="form-group">
//                         <label>Password:</label>
//                         <input
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <button type="submit">{isSigningUp ? "Sign Up" : "Login"}</button>
//                     <button type="button" onClick={() => setShowReset(true)}>Forgot Password?</button>
//                 </form>
//             )}

//             {/* Toggle between login and sign-up */}
//             {!showReset && (
//                 <button onClick={() => {
//                     setIsSigningUp(!isSigningUp);
//                     setEmail(''); // Clear email on switch
//                     setPassword(''); // Clear password on switch
//                 }}>
//                     {isSigningUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
//                 </button>
//             )}
//         </div>
//     );
// }

// export default App;

import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Firebase config file
import { useNavigate } from 'react-router-dom'; // For redirecting after login/signup
import './LoginPage.css'; // Your custom CSS for the form

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false); // Toggle between login and sign up
    const [resetEmail, setResetEmail] = useState(''); // State for reset email
    const [showReset, setShowReset] = useState(false); // State to show reset password
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
    const navigate = useNavigate(); // Used for navigating between routes

    const adminEmail = 'admin@centorimoving.com';
    const adminPassword = '1234'; // Hardcoded admin password

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            if (email === adminEmail && password === adminPassword) {
                setSuccessMessage(`Logged in successfully as admin`);
                setIsLoggedIn(true); // Set logged in status
                navigate('/admin-dashboard'); // Redirect to admin dashboard
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const userEmail = userCredential.user.email;

                setSuccessMessage(`Logged in successfully as ${userEmail}`);
                setIsLoggedIn(true); // Set logged in status
                navigate('/home'); // Redirect to home page after login

                setEmail('');
                setPassword('');
            }
        } catch (error) {
            setErrorMessage("Login failed. Incorrect password or email.");
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
            setIsLoggedIn(true); // Set logged in status
            navigate('/home'); // Redirect to home page after sign-up
            setEmail('');
            setPassword('');
        } catch (error) {
            setErrorMessage("Failed to create account. Please try again.");
        }
    };

    // Handle password reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setSuccessMessage('Reset email sent successfully! Check your inbox.');
            setResetEmail('');
            setShowReset(false); // Hide reset password form
        } catch (error) {
            setErrorMessage('Failed to send reset email. Please try again.');
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setSuccessMessage('Logged out successfully.');
            setIsLoggedIn(false); // Update logged-in state
            navigate('/'); // Redirect to login page
        } catch (error) {
            setErrorMessage('Failed to log out. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h1>Centori Moving</h1>
            <h2>{isSigningUp ? "Sign Up" : "Login"}</h2>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {showReset ? (
                <form onSubmit={handlePasswordReset}>
                    <div className="form-group">
                        <label>Enter your email:</label>
                        <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Send Reset Email</button>
                    <button type="button" onClick={() => setShowReset(false)}>Back to Login</button>
                </form>
            ) : (
                <>
                    {isLoggedIn ? (
                        <div>
                            <p>Welcome! You are logged in.</p>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
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
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">{isSigningUp ? "Sign Up" : "Login"}</button>
                            <button type="button" onClick={() => setShowReset(true)}>Forgot Password?</button>
                        </form>
                    )}
                </>
            )}

            {!showReset && !isLoggedIn && (
                <button onClick={() => {
                    setIsSigningUp(!isSigningUp);
                    setEmail(''); // Clear email on switch
                    setPassword(''); // Clear password on switch
                }}>
                    {isSigningUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                </button>
            )}
        </div>
    );
}

export default App;

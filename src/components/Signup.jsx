import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  
    const [username, setFName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            //await axios.post("http://localhost:3002/auth/signup", { Fname, Lname, email, password });
            // await signupUser(Fname,Lname,email,password);
            alert("Signup Successful. Please login.");
            navigate("/login");
        } catch (err) {
            console.log("Signup failed", err);
            alert("Signup failed. Try again.");
        }
    };
    const handleUsername = (e) => {
        setFName(e.target.value);
    }
   
    const handleEmail = (e) => {
        setEmail(e.target.value);
    }
    const handlePass = (e) => {
        setPassword(e.target.value);
    }

  return (
    
    
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
    <div className="bg-gray-900 shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-200 mb-6">Create an Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
            <input type="text" placeholder="User Name" value={username} onChange={handleUsername} required
                className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <input type="email" placeholder="Email" value={email} onChange={handleEmail} required
                className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <input type="password" placeholder="Password" value={password} onChange={handlePass} required
                className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <button type="submit" className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition duration-300">
                Sign Up
            </button>
        </form>
        <p className="text-gray-400 text-center mt-4">
            Already have an account? <Link to="/login" className="text-gray-300 hover:underline">Login</Link>
        </p>
    </div>
</div>

       
       
     
     
     
     
  
  );
}

export default Signup;

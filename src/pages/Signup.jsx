import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgroung/bg.jpg"
function Signup() {
    const [UserName, setUserName] = useState("");
    const [Password, setPassword] = useState("");
    const [Email, setemail] = useState("");
   
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();

        const user = {
            username: UserName,
            password: Password,
            email: Email,
            
        };

        // Check if user already exists
        const existingUser = JSON.parse(localStorage.getItem("user"));
        if (existingUser && existingUser.username === user.username) {
            alert("User already exists. Try a different username.");
            return;
        }

        localStorage.setItem("user", JSON.stringify(user));
        alert("Successfully signed up");
        navigate("/login");
    };

    return (
        <section className="flex items-center justify-center h-screen "
        style={{
            
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",        // Makes the image fill the entire section
            backgroundRepeat: "no-repeat",  // Prevents tiling
            backgroundPosition: "center",   // Keeps the image centered
            width: "100%",                  // Makes sure the section takes full width
             height: "100vh", 
        }}
        >
            <div className="bg-[#D9D9D9] p-8 rounded-2xl shadow-2xl w-1/3 border border-2 border-[#173B45]">
                <h2 className="text-2xl font-bold text-[#173B45] text-center">Create Account</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Join us today</p>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-gray-[#172B45] font-semibold">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="w-full px-4 py-2 rounded-lg bg-white border-2 border border-[#173B45] text-[#173B45] focus:ring-2 focus:ring-gray-400 outline-none"
                            placeholder="Enter Your Email"
                            value={Email}
                            onChange={(e) => setemail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-[#172B45] font-semibold">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-white border-2 border border-[#173B45] text-[#173B45] focus:ring-2 focus:ring-gray-400 outline-none"
                            placeholder="Enter your username"
                            value={UserName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-[#172B45] font-semibold">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-4 py-2 rounded-lg bg-white border-2 border border-[#173B45] text-[#173B45] focus:ring-2 focus:ring-gray-400 outline-none"
                            placeholder="Create a password"
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#173B45] border border-2 border-[#173B45] text-white font-semibold py-2 rounded-lg  shadow-lg"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="login text-sm text-center text-gray-900 mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-sm text-cyan-400 ">
                        Log In
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default Signup;

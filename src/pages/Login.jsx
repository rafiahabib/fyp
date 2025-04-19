import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgroung/bg.jpg"
function Login() {
    const [Email, setemail] = useState("");
    const [Password, setPassword] = useState("");
    const navigate = useNavigate();
   

    const handleLogin = (e) => {
        e.preventDefault();

        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (
            storedUser &&
            storedUser.email === Email &&
            storedUser.password === Password
        ) {
            alert("Login successful");
            navigate("/app");
        } else {
            alert("Invalid email or password");
        }
    };

    return (
        <section className="flex items-center justify-center h-screen"
        style={{
                    
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",        // Makes the image fill the entire section
                    backgroundRepeat: "no-repeat",  // Prevents tiling
                    backgroundPosition: "center",   // Keeps the image centered
                    width: "100%",                  // Makes sure the section takes full width
                     height: "100vh", 
                }}
        >
            <div className="bg-[#D9D9D9] p-8 rounded-2xl shadow-2xl w-1/3 border-2  border-[#173B45]">
                <h2 className="text-3xl font-bold text-[#173B45] text-center mb-2">Welcome To Expenza</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Login to continue</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-[#172B45] font-medium">Email</label>
                        <input
                            id="email"
                            type="text"
                            className="w-full px-4 py-2 rounded-lg text-[#173B45] bg-white border border-2 border-[#173B45] focus:ring-2 focus:ring-gray-500 outline-none text-white shadow-md"
                            placeholder="Enter your email"
                            value={Email}
                            onChange={(e) => setemail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-[#172B45] font-medium">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-4 py-2 rounded-lg bg-white text-[#173B45] border border-2 border-[#173B45]  shadow-md"
                            placeholder="Enter your password"
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#173B45] border-2 border border-[#173B45] text-white font-semibold py-2 rounded-lg t shadow-lg"
                    >
                        Login
                    </button>
                </form>

                <p className="signUp text-sm text-center text-gray-900 mt-4">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default Login;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        <section className="flex items-center justify-center h-screen bg-gradient-to-br from-black to-gray-900">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 text-white border border-gray-700">
                <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Login to continue</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 font-medium">Email</label>
                        <input
                            id="email"
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none text-white shadow-md"
                            placeholder="Enter your email"
                            value={Email}
                            onChange={(e) => setemail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 font-medium">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-gray-500 outline-none text-white shadow-md"
                            placeholder="Enter your password"
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Login
                    </button>
                </form>

                <p className="signUp text-sm text-center text-gray-400 mt-4">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-gray-300 font-semibold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default Login;


import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // AuthContext will handle sync
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to register. ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 p-4">
            <div className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl p-8 rounded-2xl w-full max-w-md relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute bottom-full left-0 mb-[-10%] ml-[-10%] w-32 h-32 bg-teal-300 rounded-full blur-2xl opacity-20"></div>
                <div className="absolute top-full right-0 mt-[-10%] mr-[-10%] w-32 h-32 bg-violet-500 rounded-full blur-2xl opacity-20"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">Create Account</h2>
                    <p className="text-gray-500 text-center mb-8">Join to start sharing securely</p>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200 outline-none"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-sm text-gray-400 font-medium">OR</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                await signInWithPopup(auth, googleProvider);
                                navigate('/dashboard');
                            } catch (err) {
                                setError('Failed to google login. ' + err.message);
                            }
                        }}
                        className="w-full px-4 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Register;

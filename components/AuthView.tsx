import React, { useState } from 'react';
import { pb } from '../services/pocketbase';
import { Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthViewProps {
    onAuthSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await pb.collection('users').authWithPassword(email, password);
            } else {
                await pb.collection('users').create({
                    email,
                    password,
                    passwordConfirm: password,
                });
                // Auto login after create
                await pb.collection('users').authWithPassword(email, password);
            }
            onAuthSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Authentication failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-indigo-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isLogin ? 'Welcome Back' : 'Join the Council'}
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {isLogin
                            ? 'Sign in to access your health profile.'
                            : 'Create a secure account to start your journey.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">Processing...</span>
                        ) : (
                            <>
                                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

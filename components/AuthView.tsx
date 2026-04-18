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
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf9] p-4 relative font-sans overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-emerald-900/[0.08] max-w-md w-full relative z-10 border border-white/50 ring-1 ring-slate-900/5">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">
                        {isLogin ? 'Welcome back' : 'Create your space'}
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        {isLogin
                            ? 'Sign in to continue your guided health desk.'
                            : 'Local-first friendly account on your PocketBase server.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100">
                            <AlertCircle size={18} className="shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">Processing...</span>
                        ) : (
                            <>
                                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline transition-colors"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full text-slate-400 text-xs">
                &copy; {new Date().getFullYear()} Health Optimus AI. Secure & Self-Hosted.
            </div>
        </div>
    );
};

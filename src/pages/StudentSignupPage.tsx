import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';
import { schoolService } from '../services/schoolService';

export const StudentSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState('10A-02');
  const [username, setUsername] = useState('ananya.sharma');
  const [email, setEmail] = useState('ananya.sharma@student.smartschool.edu');
  const [password, setPassword] = useState('ananyapassword123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await schoolService.registerStudent({
        rollNumber,
        username,
        email,
        password
      });
      navigate('/student-dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check the roll number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 mb-4 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Student Self-Registration</h1>
              <p className="text-xs text-gray-500">Link your verified student roll number to create your portal account</p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Student Roll Number *
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 10A-02 (Ananya Sharma)"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Existing demo roll numbers: 10A-01, 10A-02, 9B-05, 8A-14, 12A-09
              </span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Desired Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#1769FF] hover:bg-blue-700 text-white font-semibold rounded-xl mt-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying Student Identity...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

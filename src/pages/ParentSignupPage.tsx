import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { schoolService } from '../services/schoolService';

export const ParentSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('Kavita Mehra');
  const [childRollNumber, setChildRollNumber] = useState('9B-05');
  const [username, setUsername] = useState('kavita.mehra');
  const [email, setEmail] = useState('kavita.mehra@gmail.com');
  const [password, setPassword] = useState('kavitapassword123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await schoolService.registerParent({
        name,
        childRollNumber,
        username,
        email,
        password
      });
      navigate('/parent-dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check child roll number.');
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
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Parent Account Registration</h1>
              <p className="text-xs text-gray-500">Link your child's roll number to monitor attendance & performance</p>
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
              <label className="block font-semibold text-gray-700 mb-1">Parent Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kavita Mehra"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Child Roll Number *</label>
              <input
                type="text"
                required
                value={childRollNumber}
                onChange={(e) => setChildRollNumber(e.target.value)}
                placeholder="e.g. 9B-05 (Rohan Mehra)"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email *</label>
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
              {isLoading ? 'Verifying Student Relationship...' : 'Create Parent Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

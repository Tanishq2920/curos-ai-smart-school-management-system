import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Users,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  User,
  Info,
  CheckCircle2
} from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { UserRole } from '../types';

interface RoleOption {
  role: UserRole;
  label: string;
  defaultUsername: string;
  demoPasscode: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  activeColor: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'ADMIN',
    label: 'Administrator',
    defaultUsername: 'admin',
    demoPasscode: 'CurosAdmin@2026!',
    desc: 'Full school administration, audit trails & security governance',
    icon: ShieldCheck,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
  },
  {
    role: 'TEACHER',
    label: 'Faculty Teacher',
    defaultUsername: 'teacher',
    demoPasscode: 'CurosTeacher@2026!',
    desc: 'Assigned classes, student attendance, grading & homework',
    icon: UserCheck,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    activeColor: 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
  },
  {
    role: 'STUDENT',
    label: 'Student Portal',
    defaultUsername: 'student',
    demoPasscode: 'CurosStudent@2026!',
    desc: 'Personal timetable, homework submissions, exam results',
    icon: BookOpen,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeColor: 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
  },
  {
    role: 'PARENT',
    label: 'Parent Gateway',
    defaultUsername: 'parent',
    demoPasscode: 'CurosParent@2026!',
    desc: 'Child attendance monitor, fee payments, parent meetings',
    icon: Users,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    activeColor: 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
  }
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  const currentRoleOption = roleOptions.find((r) => r.role === selectedRole) || roleOptions[0];

  const handleRoleSelect = (roleOpt: RoleOption) => {
    setSelectedRole(roleOpt.role);
    setUsername(roleOpt.defaultUsername);
    setPassword('');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username or institutional email.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      // Send credentials and requested login role context to server
      const { user } = await schoolService.login(username.trim(), password, selectedRole);

      // Verify destination strictly from server-authorized role
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher-dashboard');
      } else if (user.role === 'STUDENT') {
        navigate('/student-dashboard');
      } else if (user.role === 'PARENT') {
        navigate('/parent-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            CUROS AI — Smart School System
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <GraduationCap className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Institutional Sign In
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Role-governed portal for administration, faculty, students, and parents.
          </p>
        </div>

        {/* Role Context Selector */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Select Intended Role Context
            </span>
            <span className="text-[11px] text-gray-400 font-medium">Server verified</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.role;
              return (
                <button
                  type="button"
                  key={opt.role}
                  onClick={() => handleRoleSelect(opt)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected ? opt.activeColor : 'border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${opt.badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5 line-clamp-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">2. Enter Credentials</h2>
              <p className="text-[11px] text-gray-500">
                Logging in under <strong className="text-gray-800">{currentRoleOption.label}</strong> context
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${currentRoleOption.badgeColor}`}>
              {selectedRole}
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Authentication Error</p>
                  <p className="text-[11px] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Username or Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`e.g. ${currentRoleOption.defaultUsername}`}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">Account Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#1769FF] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Server Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Navigation */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/signup-student" className="text-blue-600 hover:underline font-medium">
              Student Registration →
            </Link>
            <Link to="/signup-parent" className="text-blue-600 hover:underline font-medium">
              Parent Portal Sign Up →
            </Link>
          </div>
        </div>

        {/* Development & Testing Credentials Reference */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Development & Testing Notice</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="text-[11px] text-blue-600 hover:underline cursor-pointer"
            >
              {showDemoCredentials ? 'Hide passcodes' : 'Show initial passcodes'}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
            Initial demo accounts are provided for local verification and automated testing. Role authorization is enforced strictly server-side. Passwords must be securely replaced before production use.
          </p>

          {showDemoCredentials && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
              {roleOptions.map((opt) => (
                <div
                  key={opt.role}
                  className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[11px] text-gray-800">{opt.label}:</span>
                    <span className="text-[11px] text-gray-500 ml-1 font-mono">{opt.defaultUsername}</span>
                    <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                      {opt.demoPasscode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleSelect(opt);
                      setPassword(opt.demoPasscode);
                    }}
                    className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-400">
          CUROS AI • Smart School Management System • Secure Role-Based Access Control
        </p>
      </div>
    </div>
  );
};

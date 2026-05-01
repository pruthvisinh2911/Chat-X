import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required.'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setDone(true)
  }

  const strengthScore = () => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
  const strengthColor = ['', 'bg-rose-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-400']
  const score = strengthScore()
  const passwordsMatch = form.confirm && form.password === form.confirm

  if (done) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[40%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
        <div className="w-full max-w-sm relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
            <CheckCircle2 size={30} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Password updated!</h1>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Your password has been changed.<br />You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-sm font-medium rounded-xl py-3 transition-all shadow-lg shadow-violet-500/20 active:scale-[0.99]"
          >
            Go to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[30%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[300px] h-[300px] rounded-full bg-pink-600/8 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Reset password</h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your details to set a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">Username</label>
            <input
              type="text"
              placeholder="yourhandle"
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value })
                if (errors.username) setErrors(prev => ({ ...prev, username: '' }))
              }}
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all
                ${errors.username
                  ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-zinc-800 focus:border-violet-500/70 focus:ring-violet-500/30'
                }`}
            />
            {errors.username && <p className="text-xs text-rose-400 mt-1.5 ml-0.5">{errors.username}</p>}
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value })
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                }}
                className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all
                  ${errors.password
                    ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-zinc-800 focus:border-violet-500/70 focus:ring-violet-500/30'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {form.password.length > 0 && (
              <div className="mt-2.5 px-0.5">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= score ? strengthColor[score] : 'bg-zinc-800'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-500">{strengthLabel[score]}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-rose-400 mt-1.5 ml-0.5">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => {
                  setForm({ ...form, confirm: e.target.value })
                  if (errors.confirm) setErrors(prev => ({ ...prev, confirm: '' }))
                }}
                className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all
                  ${errors.confirm
                    ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30'
                    : passwordsMatch
                      ? 'border-emerald-500/50 focus:border-emerald-500/70 focus:ring-emerald-500/20'
                      : 'border-zinc-800 focus:border-violet-500/70 focus:ring-violet-500/30'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-rose-400 mt-1.5 ml-0.5">{errors.confirm}</p>}
            {passwordsMatch && !errors.confirm && (
              <p className="text-xs text-emerald-400 mt-1.5 ml-0.5 flex items-center gap-1">
                <CheckCircle2 size={11} /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-sm font-medium rounded-xl py-3 mt-1 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.99]"
          >
            Reset password
          </button>
        </form>
      </div>
    </div>
  )
}

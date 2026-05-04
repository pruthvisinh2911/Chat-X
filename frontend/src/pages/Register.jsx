import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")

  const navigate = useNavigate()

  // ✅ VALIDATION
  const validate = () => {
    let newErrors = {}

    if (form.firstName.trim().length < 2) {
      newErrors.firstName = "At least 2 characters required"
    }

    if (form.lastName.trim().length < 2) {
      newErrors.lastName = "At least 2 characters required"
    }

    if (form.username.length < 3 || form.username.length > 20) {
      newErrors.username = "Username must be 3–20 characters"
    } else if (!/^[a-z0-9_]+$/.test(form.username)) {
      newErrors.username = "Only lowercase, numbers, underscore"
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(form.password)) {
      newErrors.password = "Min 8 chars + number + special char"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setServerError("")

    if (!validate()) return

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.message?.toLowerCase().includes("username")) {
          setErrors({ username: data.message })
        } else if (data.message?.toLowerCase().includes("email")) {
          setErrors({ email: data.message })
        } else {
          setServerError(data.message)
        }
        return
      }

      localStorage.setItem("verifyEmail", form.email)
      navigate("/verify")

    } catch (error) {
      console.error("Register error:", error)
      setServerError("Server error")
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-8 relative overflow-y-auto">
      <div className="absolute top-[-20%] right-[30%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-pink-600/8 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-7 md:mb-8">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-500 mt-1">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">First name</label>
              <input
                type="text"
                placeholder="Alex"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
                required
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">Last name</label>
              <input
                type="text"
                placeholder="Kim"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
                required
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">Username</label>
            <input
              type="text"
              placeholder="alexkim"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
              required
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>


          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">Email</label>
            <input
              type="email"
              placeholder="alex@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-0.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Server Error */}
          {serverError && (
            <p className="text-red-500 text-sm text-center">{serverError}</p>
          )}

          {/* Terms */}
          <p className="text-xs text-zinc-600 leading-relaxed px-0.5">
            By creating an account, you agree to our{' '}
            <span className="text-zinc-500 cursor-pointer hover:text-zinc-400">Terms</span> and{' '}
            <span className="text-zinc-500 cursor-pointer hover:text-zinc-400">Privacy Policy</span>.
          </p>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-sm font-medium rounded-xl py-3 mt-1 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.99]"
          >
            Create account
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
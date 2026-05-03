import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft, RefreshCw } from 'lucide-react'

export default function OtpVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [shake, setShake] = useState(false)
  const [email, setEmail] = useState('')
  const inputRefs = useRef([])
  const navigate = useNavigate()

  // 🔹 Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('verifyEmail')
    if (!storedEmail) {
      navigate('/register')
    } else {
      setEmail(storedEmail)
    }
  }, [navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer === 0) { setCanResend(true); return }
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
        const next = [...otp]
        next[index - 1] = ''
        setOtp(next)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    const lastFilled = Math.min(pasted.length, 5)
    inputRefs.current[lastFilled]?.focus()
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  // 🔥 REAL VERIFY LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault()

    const code = otp.join('')

    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      triggerShake()
      return
    }

    if (!email) {
      navigate('/register')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      })

      const data = await res.json()

      if (res.ok) {
        // ✅ SUCCESS
        localStorage.removeItem('verifyEmail')
        navigate('/login')
      } else {
        // ❌ FAILURE
        setError(data.message || 'Invalid OTP')
        triggerShake()
      }

    } catch (err) {
      setError('Server error. Please try again.')
      triggerShake()
    }
  }

const handleResend = async () => {
  if (!canResend) return

  try {
    const res = await fetch('http://localhost:5000/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await res.json()

    // ✅ HANDLE ERROR RESPONSE (THIS WAS MISSING)
    if (!res.ok) {
      setError(data.message || "Failed to resend OTP")
      triggerShake()
      return
    }

    // ✅ SUCCESS FLOW (same as your existing logic)
    setCanResend(false)
    setResendTimer(60)
    setOtp(['', '', '', '', '', ''])
    setError('')
    inputRefs.current[0]?.focus()

  } catch (err) {
    setError("Server error. Please try again.")
    triggerShake()
  }
}
  const filled = otp.filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[40%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] rounded-full bg-pink-600/8 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Verify your email</h1>
          <p className="text-sm text-zinc-500 mt-1.5 text-center leading-relaxed">
            We sent a 6-digit code to<br />
            <span className="text-zinc-300 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className={`flex gap-2.5 justify-center mb-2 transition-all ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
            style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 md:w-13 md:h-15 text-center text-xl font-semibold rounded-xl border bg-zinc-900 text-white transition-all focus:outline-none select-none
                  ${error
                    ? 'border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                    : digit
                      ? 'border-violet-500/60 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30'
                      : 'border-zinc-800 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30'
                  }`}
              />
            ))}
          </div>

          <div className="h-5 mb-5 text-center">
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={filled < 6}
            className={`w-full text-white text-sm font-medium rounded-xl py-3 transition-all
              ${filled === 6
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.99]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
          >
            Verify & continue
          </button>

          <div className="flex justify-center gap-1.5 mt-5">
            {otp.map((d, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${d ? 'bg-violet-500' : 'bg-zinc-700'}`}
              />
            ))}
          </div>
        </form>

        <div className="mt-7 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              <RefreshCw size={13} />
              Resend code
            </button>
          ) : (
            <p className="text-sm text-zinc-600">
              Resend code in{' '}
              <span className="text-zinc-400 font-medium tabular-nums">{resendTimer}s</span>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}


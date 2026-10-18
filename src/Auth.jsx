import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabase'
import { Password } from './ui.jsx'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setBusy(true); setMsg('')
    const creds = { email: email.trim(), password: senha }
    const { data, error } = mode === 'login' ? await supabase.auth.signInWithPassword(creds) : await supabase.auth.signUp(creds)
    setBusy(false)
    if (error) return setMsg(error.message)
    if (mode === 'signup' && !data.session) setMsg('Conta criada. Confirme o e-mail que enviamos e depois entre.')
  }

  return (
    <div className="auth">
      <motion.div className="blob" animate={{ scale: [1, 1.15, 1], rotate: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.h1 className="display" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
        Saia do<br /><span className="mark">vermelho.</span>
      </motion.h1>
      <p className="mute">Controle seus gastos, mate as dívidas e saiba o que fazer com cada real.</p>
      <motion.form className="sheet" onSubmit={enviar} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', damping: 22 }}>
        <input type="email" placeholder="E-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Password value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        <motion.button className="cta" whileTap={{ scale: 0.97 }} disabled={busy || !email || senha.length < 6}>
          {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </motion.button>
        <AnimatePresence>{msg && <motion.div className="note bad" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{msg}</motion.div>}</AnimatePresence>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg('') }}>
          {mode === 'login' ? 'Não tenho conta' : 'Já tenho conta'}
        </button>
      </motion.form>
    </div>
  )
}

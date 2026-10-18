import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function enviar() {
    setBusy(true)
    setMsg('')
    const creds = { email: email.trim(), password: senha }
    const { data, error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp(creds)
    setBusy(false)
    if (error) return setMsg(error.message)
    if (mode === 'signup' && !data.session)
      setMsg('Conta criada. Confirme o e-mail que enviamos e depois entre.')
  }

  return (
    <main>
      <h1>Saia do Vermelho</h1>
      <p className="mute">
        {mode === 'login' ? 'Entre para ver seus dados.' : 'Crie sua conta para salvar seus dados.'}
      </p>
      <div className="f">
        <input type="email" placeholder="E-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha (mínimo 6 caracteres)" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={senha} onChange={(e) => setSenha(e.target.value)} />
        <button disabled={busy || !email || senha.length < 6} onClick={enviar}>
          {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
        {msg && <div className="card warn">{msg}</div>}
        <button className="ghost" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg('') }}>
          {mode === 'login' ? 'Não tenho conta' : 'Já tenho conta'}
        </button>
      </div>
    </main>
  )
}

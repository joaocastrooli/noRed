import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import Auth from './Auth.jsx'
import { Resumo, Lancar, Dividas, Plano } from './tabs.jsx'
import { EMPTY } from './lib'

const TABS = [['resumo', 'Resumo'], ['lancar', 'Lançar'], ['dividas', 'Dívidas'], ['plano', 'Plano']]

function Home({ user }) {
  const [S, setS] = useState(EMPTY)
  const [tab, setTab] = useState('resumo')
  const [status, setStatus] = useState('Carregando…')
  const loaded = useRef(false)
  const timer = useRef(null)

  useEffect(() => {
    supabase.from('finance_data').select('data').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (error) return setStatus('Erro ao carregar')
        setS({ ...EMPTY, ...(data?.data || {}) })
        loaded.current = true
        setStatus('Salvo')
      })
  }, [user.id])

  function update(fn) {
    setS((prev) => {
      const next = fn(prev)
      if (loaded.current) {
        setStatus('Salvando…')
        clearTimeout(timer.current)
        timer.current = setTimeout(async () => {
          const { error } = await supabase.from('finance_data')
            .upsert({ user_id: user.id, data: next, updated_at: new Date().toISOString() })
          setStatus(error ? 'Erro ao salvar' : 'Salvo')
        }, 600)
      }
      return next
    })
  }

  const View = { resumo: Resumo, lancar: Lancar, dividas: Dividas, plano: Plano }[tab]
  return (
    <>
      <main>
        <div className="top">
          <span className="mute">{status}</span>
          <button className="ghost" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
        {loaded.current ? <View S={S} update={update} /> : <p className="mute">{status}</p>}
      </main>
      <nav>
        {TABS.map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <main><p className="mute">Carregando…</p></main>
  return session ? <Home user={session.user} key={session.user.id} /> : <Auth />
}

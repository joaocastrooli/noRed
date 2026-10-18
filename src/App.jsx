import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, PlusCircle, Landmark, Target, LogOut } from 'lucide-react'
import { supabase } from './supabase'
import Auth from './Auth.jsx'
import { Resumo, Lancar, Dividas, Plano } from './tabs.jsx'
import { EMPTY, today } from './lib'
import { MonthNav } from './ui.jsx'

const TABS = [['resumo', 'Resumo', LayoutDashboard], ['lancar', 'Lançar', PlusCircle], ['dividas', 'Dívidas', Landmark], ['plano', 'Plano', Target]]
const TITLE = { resumo: 'Resumo', lancar: 'Novo lançamento', dividas: 'Dívidas', plano: 'Seu plano' }

function Home({ user }) {
  const [S, setS] = useState(EMPTY)
  const [tab, setTab] = useState('resumo')
  const [mes, setMes] = useState(today().slice(0, 7))
  const [status, setStatus] = useState('Carregando…')
  const loaded = useRef(false)
  const timer = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.from('finance_data').select('data').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (error) return setStatus('Erro ao carregar')
      setS({ ...EMPTY, ...(data?.data || {}) })
      loaded.current = true; setReady(true); setStatus('Salvo')
    })
  }, [user.id])

  function update(fn) {
    setS((prev) => {
      const next = fn(prev)
      if (loaded.current) {
        setStatus('Salvando…')
        clearTimeout(timer.current)
        timer.current = setTimeout(async () => {
          const { error } = await supabase.from('finance_data').upsert({ user_id: user.id, data: next, updated_at: new Date().toISOString() })
          setStatus(error ? 'Erro ao salvar' : 'Salvo')
        }, 600)
      }
      return next
    })
  }

  const View = { resumo: Resumo, lancar: Lancar, dividas: Dividas, plano: Plano }[tab]
  return (
    <>
      <header className="top">
        <div><span className={`sync ${status === 'Salvo' ? 'ok' : ''}`} /> <span className="mute">{status}</span><h1>{TITLE[tab]}</h1></div>
        <button className="icon" aria-label="Sair" onClick={() => supabase.auth.signOut()}><LogOut size={20} /></button>
      </header>
      <main>
        {(tab === 'resumo' || tab === 'lancar') && <MonthNav ym={mes} setYm={setMes} />}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {ready ? <View S={S} update={update} mes={mes} setMes={setMes} /> : <p className="mute">{status}</p>}
          </motion.div>
        </AnimatePresence>
      </main>
      <nav>
        {TABS.map(([k, l, Icon]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {tab === k && <motion.span layoutId="nav" className="pill" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
            <Icon size={21} /><em>{l}</em>
          </button>
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

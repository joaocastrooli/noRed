import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Trash2, Flame, Check } from 'lucide-react'
import { CATS, R, num, today, byMonth, onlyNum, sim } from './lib'
import { Money, DatePicker, item, stagger } from './ui.jsx'

const COR = { Moradia: '#e5412d', Alimentação: '#f2a516', Transporte: '#2f6fed', Saúde: '#0f8a5f', Lazer: '#d1478c', Dívidas: '#3b3631', Outros: '#9a948a' }
const Page = ({ children }) => <div className="page">{children}</div>

export function Resumo({ S, mes }) {
  const t = byMonth(S.tx, mes)
  const rec = t.filter((x) => x.tipo === 'r').reduce((a, x) => a + x.v, 0)
  const des = t.filter((x) => x.tipo === 'd').reduce((a, x) => a + x.v, 0)
  const sal = rec - des
  const by = {}
  t.filter((x) => x.tipo === 'd').forEach((x) => (by[x.c] = (by[x.c] || 0) + x.v))
  const cats = Object.entries(by).sort((a, b) => b[1] - a[1])
  const td = S.debts.reduce((a, x) => a + x.saldo, 0)
  const pct = rec > 0 ? Math.min(100, (des / rec) * 100) : des > 0 ? 100 : 0
  const tone = pct >= 100 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--green)'
  const msg = !t.length ? 'Registre entradas e saídas para ver o retrato real.' : sal < 0 ? `Você gastou ${R(-sal)} a mais do que ganhou. Corte primeiro na maior categoria.` : `Sobrou dinheiro. Mande tudo para as dívidas na aba Plano.`
  return (
    <Page>
      <motion.section className={`hero ${t.length ? (sal < 0 ? 'neg' : 'pos') : ''}`} {...item} {...stagger(0)}>
        <span className="eyebrow">Saldo do mês</span>
        <Money v={sal} className="big" />
        <p>{msg}</p>
        <div className="thermo"><motion.i initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} style={{ background: tone }} /></div>
        <span className="mute">{Math.round(pct)}% da renda já foi gasta</span>
      </motion.section>
      <div className="grid2">
        <motion.div className="tile" {...item} {...stagger(1)} whileTap={{ scale: 0.96 }}><ArrowUpRight className="in" /><span className="mute">Entrou</span><Money v={rec} className="in v" /></motion.div>
        <motion.div className="tile" {...item} {...stagger(2)} whileTap={{ scale: 0.96 }}><ArrowDownRight className="out" /><span className="mute">Saiu</span><Money v={des} className="out v" /></motion.div>
      </div>
      <motion.div className="tile wide" {...item} {...stagger(3)}><Flame className="out" /><span className="mute">Em dívidas</span><Money v={td} className="out v" /></motion.div>
      <h2>Para onde foi o dinheiro</h2>
      {cats.length ? (
        <motion.div className="panel donut" {...item} {...stagger(4)}>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={cats.map(([n, v]) => ({ n, v }))} dataKey="v" innerRadius="68%" outerRadius="100%" paddingAngle={3} cornerRadius={6} stroke="none" animationDuration={900}>
                {cats.map(([n]) => <Cell key={n} fill={COR[n]} />)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div className="mid"><span className="mute">Gastos</span><b>{R(des)}</b></div>
          </div>
          <div className="legend">
            {cats.map(([n, v]) => (
              <div key={n}><i style={{ background: COR[n] }} /><span>{n}</span><b>{Math.round((v / des) * 100)}%</b></div>
            ))}
          </div>
        </motion.div>
      ) : <p className="mute">Nada registrado ainda.</p>}
    </Page>
  )
}

export function Lancar({ S, update, mes, setMes }) {
  const [f, setF] = useState({ tipo: 'd', v: '', c: CATS[0], ds: '', d: today() })
  const [ok, setOk] = useState(false)
  const t = [...byMonth(S.tx, mes)].sort((a, b) => b.d.localeCompare(a.d) || b.id - a.id)
  function add() {
    const v = num(f.v)
    if (v <= 0) return
    update((s) => ({ ...s, tx: [...s.tx, { id: Date.now(), tipo: f.tipo, v, c: f.tipo === 'r' ? 'Entrada' : f.c, ds: f.ds.trim(), d: f.d || today() }] }))
    setF({ ...f, v: '', ds: '' }); setMes(f.d.slice(0, 7)); setOk(true); setTimeout(() => setOk(false), 1200)
  }
  return (
    <Page>
      <div className="seg">
        {[['d', 'Saída'], ['r', 'Entrada']].map(([k, l]) => (
          <button key={k} onClick={() => setF({ ...f, tipo: k })} className={f.tipo === k ? 'on' : ''}>
            {f.tipo === k && <motion.span layoutId="seg" className="pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}<em>{l}</em>
          </button>
        ))}
      </div>
      <div className="amount"><span>R$</span><input inputMode="decimal" placeholder="0,00" value={f.v} onChange={(e) => setF({ ...f, v: onlyNum(e.target.value) })} /></div>
      {f.tipo === 'd' && (
        <div className="chips">{CATS.map((c) => <motion.button whileTap={{ scale: 0.92 }} key={c} className={`chip ${f.c === c ? 'on' : ''}`} onClick={() => setF({ ...f, c })}><i style={{ background: COR[c] }} />{c}</motion.button>)}</div>
      )}
      <div className="grid2"><input placeholder="Descrição (opcional)" value={f.ds} onChange={(e) => setF({ ...f, ds: e.target.value })} /><DatePicker value={f.d} onChange={(d) => setF({ ...f, d })} /></div>
      <motion.button className="cta" whileTap={{ scale: 0.97 }} onClick={add}>{ok ? <><Check size={20} /> Adicionado</> : 'Adicionar lançamento'}</motion.button>
      <h2>Lançamentos do mês</h2>
      <AnimatePresence initial={false}>
        {t.map((x) => (
          <motion.div layout key={x.id} className="row" {...item}>
            <i className="dot" style={{ background: x.tipo === 'r' ? 'var(--green)' : COR[x.c] }} />
            <div className="grow"><b>{x.ds || x.c}</b><span className="mute">{x.d.split('-').reverse().join('/')} · {x.c}</span></div>
            <b className={x.tipo === 'r' ? 'in' : 'out'}>{x.tipo === 'r' ? '+' : '−'}{R(x.v)}</b>
            <button className="icon" aria-label="Apagar" onClick={() => update((s) => ({ ...s, tx: s.tx.filter((y) => y.id !== x.id) }))}><Trash2 size={18} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
      {!t.length && <p className="mute">Nenhum lançamento neste mês. Comece pelo último gasto que lembrar.</p>}
    </Page>
  )
}

export function Dividas({ S, update }) {
  const [f, setF] = useState({ nome: '', saldo: '', taxa: '', min: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const setN = (k) => (e) => setF({ ...f, [k]: onlyNum(e.target.value) })
  const td = S.debts.reduce((a, x) => a + x.saldo, 0)
  function add() {
    const saldo = num(f.saldo)
    if (!f.nome.trim() || saldo <= 0) return
    update((s) => ({ ...s, debts: [...s.debts, { id: Date.now(), nome: f.nome.trim(), saldo, taxa: num(f.taxa), min: num(f.min) }] }))
    setF({ nome: '', saldo: '', taxa: '', min: '' })
  }
  return (
    <Page>
      <section className="hero neg"><span className="eyebrow">Total devendo</span><Money v={td} className="big" /></section>
      <div className="panel form">
        <input placeholder="Nome (ex.: Cartão Nubank)" value={f.nome} onChange={set('nome')} />
        <div className="grid2"><input inputMode="decimal" placeholder="Deve hoje (R$)" value={f.saldo} onChange={setN('saldo')} /><input inputMode="decimal" placeholder="Juros ao mês (%)" value={f.taxa} onChange={setN('taxa')} /></div>
        <input inputMode="decimal" placeholder="Parcela mínima por mês (R$)" value={f.min} onChange={setN('min')} />
        <motion.button className="cta" whileTap={{ scale: 0.97 }} onClick={add}>Adicionar dívida</motion.button>
      </div>
      <AnimatePresence initial={false}>
        {S.debts.map((x) => (
          <motion.div layout key={x.id} className="debt" {...item} whileHover={{ y: -3 }}>
            <div className="grow"><b>{x.nome}</b><span className="mute">mínimo {R(x.min)}/mês</span></div>
            <span className="badge">{x.taxa}% a.m.</span>
            <b className="out">{R(x.saldo)}</b>
            <button className="icon" aria-label="Apagar" onClick={() => update((s) => ({ ...s, debts: s.debts.filter((y) => y.id !== x.id) }))}><Trash2 size={18} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
      {!S.debts.length && <p className="mute">Liste todas as dívidas, mesmo as pequenas: o plano precisa do quadro completo.</p>}
    </Page>
  )
}

export function Plano({ S, update }) {
  const [renda, setRenda] = useState(S.plan.renda || '')
  const [ess, setEss] = useState(S.plan.ess || '')
  const { renda: rd, ess: es } = S.plan
  const mins = S.debts.reduce((a, x) => a + x.min, 0)
  const sobra = rd - es - mins
  const r = S.debts.length ? sim(S.debts, mins + Math.max(sobra, 0)) : null
  const ord = [...S.debts].sort((a, b) => b.taxa - a.taxa)
  const passos = [
    ['Pague os essenciais', R(es), 'Moradia, comida, transporte e saúde vêm antes de tudo.'],
    ['Pague o mínimo de todas as dívidas', R(mins), 'Evita multa e nome sujo.'],
    [`Toda a sobra na dívida mais cara${ord[0] ? `: ${ord[0].nome} (${ord[0].taxa}% a.m.)` : ''}`, R(Math.max(sobra, 0)), 'Quando ela acabar, passe o valor para a próxima.'],
    ['Sem dívidas, monte a reserva', R(es * 3), 'Guarde até 3 meses de gastos essenciais.'],
  ]
  return (
    <Page>
      <div className="panel form">
        <input inputMode="decimal" placeholder="Renda mensal (R$)" value={renda} onChange={(e) => setRenda(onlyNum(e.target.value))} />
        <input inputMode="decimal" placeholder="Gastos essenciais por mês (R$)" value={ess} onChange={(e) => setEss(onlyNum(e.target.value))} />
        <motion.button className="cta" whileTap={{ scale: 0.97 }} onClick={() => update((s) => ({ ...s, plan: { renda: num(renda), ess: num(ess) } }))}>Calcular plano</motion.button>
      </div>
      {rd > 0 && (
        <>
          <motion.section className={`hero ${sobra < 0 ? 'neg' : 'pos'}`} {...item}><span className="eyebrow">Sobra por mês</span><Money v={sobra} className="big" />
            {sobra < 0 && <p>Faltam {R(-sobra)}. Renegocie as dívidas (peça desconto à vista) e corte o que não é essencial.</p>}</motion.section>
          {r && (
            <motion.div className={`panel free ${r.ok ? '' : 'bad'}`} {...item} {...stagger(1)}>
              {r.ok ? <><span className="eyebrow">Livre das dívidas em</span><div className="months"><Money v={r.m} className="big" /> <span>{r.m === 1 ? 'mês' : 'meses'}</span></div><span className="mute">Você pagaria {R(r.juros)} de juros no total.</span>
                {r.ord.map(([n, m]) => <div className="row" key={n + m}><Check size={18} className="in" /><div className="grow">{n}</div><b>mês {m}</b></div>)}</>
                : 'Com esse valor as dívidas não diminuem: os juros comem o pagamento. Aumente a sobra ou renegocie.'}
            </motion.div>
          )}
          <h2>O que fazer com o dinheiro</h2>
          {passos.map(([t, v, d], i) => (
            <motion.div className="step" key={t} {...item} {...stagger(i + 2)} whileHover={{ x: 4 }}>
              <span className="n">{i + 1}</span><div className="grow"><b>{t}</b><span className="mute">{d}</span></div><b>{v}</b>
            </motion.div>
          ))}
          <p className="mute">Estimativa: assume juros e pagamentos constantes e nenhum gasto novo no crédito.</p>
        </>
      )}
    </Page>
  )
}

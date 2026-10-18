import { useState } from 'react'
import { CATS, R, num, today, thisMonth, sim } from './lib'

export function Resumo({ S }) {
  const t = thisMonth(S.tx)
  const rec = t.filter((x) => x.tipo === 'r').reduce((a, x) => a + x.v, 0)
  const des = t.filter((x) => x.tipo === 'd').reduce((a, x) => a + x.v, 0)
  const sal = rec - des
  const by = {}
  t.filter((x) => x.tipo === 'd').forEach((x) => (by[x.c] = (by[x.c] || 0) + x.v))
  const cats = Object.entries(by).sort((a, b) => b[1] - a[1])
  const td = S.debts.reduce((a, x) => a + x.saldo, 0)
  const msg = !t.length
    ? 'Registre suas entradas e saídas deste mês para ver o retrato real.'
    : sal < 0
    ? `Você gastou ${R(-sal)} a mais do que ganhou. Olhe a maior categoria abaixo e corte primeiro nela.`
    : `Sobrou ${R(sal)} este mês. Vá para a aba Plano e direcione isso às dívidas.`
  return (
    <>
      <h1>Este mês</h1>
      <div className={`hero ${t.length ? (sal < 0 ? 'neg' : 'pos') : ''}`}>
        <div className="mute">Saldo do mês</div>
        <div className="big">{R(sal)}</div>
        <div className="mute">{msg}</div>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <div className="card"><div className="mute">Entrou</div><b className="in">{R(rec)}</b></div>
        <div className="card"><div className="mute">Saiu</div><b className="out">{R(des)}</b></div>
      </div>
      <div className="card"><div className="mute">Total em dívidas</div><b className="out">{R(td)}</b></div>
      <h2>Para onde foi o dinheiro</h2>
      {cats.length ? cats.map(([c, v]) => (
        <div className="card" key={c}>
          <div className="item" style={{ padding: 0, border: 0 }}><span>{c}</span><b>{R(v)}</b></div>
          <div className="bar"><i style={{ width: `${Math.round((v / des) * 100)}%` }} /></div>
        </div>
      )) : <p className="mute">Nada registrado ainda.</p>}
    </>
  )
}

export function Lancar({ S, update }) {
  const [f, setF] = useState({ tipo: 'd', v: '', c: CATS[0], ds: '', d: today() })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const t = [...thisMonth(S.tx)].sort((a, b) => b.d.localeCompare(a.d) || b.id - a.id)
  function add() {
    const v = num(f.v)
    if (v <= 0) return
    update((s) => ({ ...s, tx: [...s.tx, { id: Date.now(), tipo: f.tipo, v, c: f.c, ds: f.ds.trim(), d: f.d || today() }] }))
    setF({ ...f, v: '', ds: '' })
  }
  return (
    <>
      <h1>Lançamentos</h1>
      <div className="f">
        <select value={f.tipo} onChange={set('tipo')}>
          <option value="d">Saída (gasto)</option>
          <option value="r">Entrada (ganho)</option>
        </select>
        <input inputMode="decimal" placeholder="Valor, ex.: 35,90" value={f.v} onChange={set('v')} />
        <select value={f.c} onChange={set('c')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <input placeholder="Descrição (opcional)" value={f.ds} onChange={set('ds')} />
        <input type="date" value={f.d} onChange={set('d')} />
        <button onClick={add}>Adicionar lançamento</button>
      </div>
      <h2>Deste mês</h2>
      {t.length ? t.map((x) => (
        <div className="item" key={x.id}>
          <div>
            <b>{x.ds || x.c}</b>
            <div className="mute">{x.d.split('-').reverse().join('/')} · {x.tipo === 'r' ? 'Entrada' : x.c}</div>
          </div>
          <div>
            <b className={x.tipo === 'r' ? 'in' : 'out'}>{x.tipo === 'r' ? '+' : '−'}{R(x.v)}</b>{' '}
            <button className="ghost" aria-label="Apagar" onClick={() => update((s) => ({ ...s, tx: s.tx.filter((y) => y.id !== x.id) }))}>✕</button>
          </div>
        </div>
      )) : <p className="mute">Nenhum lançamento neste mês. Comece pelo último gasto que você lembra.</p>}
    </>
  )
}

export function Dividas({ S, update }) {
  const [f, setF] = useState({ nome: '', saldo: '', taxa: '', min: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const td = S.debts.reduce((a, x) => a + x.saldo, 0)
  function add() {
    const saldo = num(f.saldo)
    if (!f.nome.trim() || saldo <= 0) return
    update((s) => ({ ...s, debts: [...s.debts, { id: Date.now(), nome: f.nome.trim(), saldo, taxa: num(f.taxa), min: num(f.min) }] }))
    setF({ nome: '', saldo: '', taxa: '', min: '' })
  }
  return (
    <>
      <h1>Dívidas</h1>
      <div className="f">
        <input placeholder="Nome (ex.: Cartão Nubank)" value={f.nome} onChange={set('nome')} />
        <input inputMode="decimal" placeholder="Quanto você deve hoje (R$)" value={f.saldo} onChange={set('saldo')} />
        <input inputMode="decimal" placeholder="Juros ao mês em % (ex.: 12)" value={f.taxa} onChange={set('taxa')} />
        <input inputMode="decimal" placeholder="Parcela mínima por mês (R$)" value={f.min} onChange={set('min')} />
        <button onClick={add}>Adicionar dívida</button>
      </div>
      <h2>Total: {R(td)}</h2>
      {S.debts.length ? S.debts.map((x) => (
        <div className="item" key={x.id}>
          <div><b>{x.nome}</b><div className="mute">{x.taxa}% ao mês · mínimo {R(x.min)}</div></div>
          <div>
            <b className="out">{R(x.saldo)}</b>{' '}
            <button className="ghost" aria-label="Apagar" onClick={() => update((s) => ({ ...s, debts: s.debts.filter((y) => y.id !== x.id) }))}>✕</button>
          </div>
        </div>
      )) : <p className="mute">Sem dívidas cadastradas. Liste todas, mesmo as pequenas: o plano precisa do quadro completo.</p>}
    </>
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
  return (
    <>
      <h1>Plano</h1>
      <p className="mute">Informe o que entra e o que é obrigatório todo mês.</p>
      <div className="f">
        <input inputMode="decimal" placeholder="Renda mensal (R$)" value={renda} onChange={(e) => setRenda(e.target.value)} />
        <input inputMode="decimal" placeholder="Gastos essenciais por mês: moradia, comida, transporte, saúde (R$)" value={ess} onChange={(e) => setEss(e.target.value)} />
        <button onClick={() => update((s) => ({ ...s, plan: { renda: num(renda), ess: num(ess) } }))}>Calcular plano</button>
      </div>
      {rd > 0 && (
        <>
          <div className={`card ${sobra < 0 ? 'warn' : ''}`}>
            <div className="mute">Sobra por mês, depois dos essenciais e dos mínimos</div>
            <div className={`big ${sobra < 0 ? 'out' : 'in'}`} style={{ fontSize: 30 }}>{R(sobra)}</div>
          </div>
          {sobra < 0 && <div className="card warn">Faltam {R(-sobra)} por mês. Antes de pagar extra, renegocie as dívidas (peça desconto para pagar à vista ou parcelas menores) e corte gastos não essenciais.</div>}
          <h2>O que fazer com o dinheiro, em ordem</h2>
          <div className="card">
            <div className="step"><div className="n">1</div><div><b>Pague os essenciais ({R(es)})</b><div className="mute">Moradia, comida, transporte e saúde vêm antes de tudo.</div></div></div>
            <div className="step"><div className="n">2</div><div><b>Pague o mínimo de todas as dívidas ({R(mins)})</b><div className="mute">Evita multa e nome sujo.</div></div></div>
            <div className="step"><div className="n">3</div><div><b>Jogue toda a sobra na dívida de juros mais altos{ord[0] ? `: ${ord[0].nome} (${ord[0].taxa}% ao mês)` : ''}</b><div className="mute">Quando ela acabar, passe o valor para a próxima mais cara.</div></div></div>
            <div className="step"><div className="n">4</div><div><b>Sem dívidas, monte uma reserva</b><div className="mute">Guarde até 3 meses de gastos essenciais ({R(es * 3)}).</div></div></div>
          </div>
          {r && (
            <>
              <h2>Previsão</h2>
              <div className={`card ${r.ok ? '' : 'warn'}`}>
                {r.ok ? <>Com esse ritmo você quita tudo em <b>{r.m} {r.m === 1 ? 'mês' : 'meses'}</b>, pagando {R(r.juros)} de juros no total.</> : 'Com esse valor as dívidas não diminuem: os juros comem o pagamento. Aumente a sobra ou renegocie.'}
                {r.ok && r.ord.map(([n, m]) => <div className="item" key={n + m}><span>{n}</span><b>quitada no mês {m}</b></div>)}
              </div>
            </>
          )}
          <p className="mute">Estimativa: assume juros e pagamentos constantes e nenhum gasto novo no crédito.</p>
        </>
      )}
    </>
  )
}

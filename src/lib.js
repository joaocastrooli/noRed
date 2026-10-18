export const CATS = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Dívidas', 'Outros']
export const EMPTY = { tx: [], debts: [], plan: { renda: 0, ess: 0 } }

export const R = (n) =>
  (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const num = (v) => parseFloat(String(v).replace(',', '.')) || 0
export const today = () => new Date().toISOString().slice(0, 10)
export const thisMonth = (tx) => tx.filter((t) => t.d.slice(0, 7) === today().slice(0, 7))

// Simula o método "avalanche": sobra vai para a dívida de maior juros.
export function sim(debts, budget) {
  let d = debts.map((x) => ({ ...x })).filter((x) => x.saldo > 0)
  let m = 0, juros = 0
  const ord = []
  while (d.length && m < 600) {
    m++
    d.forEach((x) => { const j = (x.saldo * x.taxa) / 100; x.saldo += j; juros += j })
    let b = budget
    d.forEach((x) => { const p = Math.min(x.min, x.saldo); x.saldo -= p; b -= p })
    d.sort((a, c) => c.taxa - a.taxa)
    for (const x of d) {
      if (b <= 0) break
      const p = Math.min(b, x.saldo)
      x.saldo -= p
      b -= p
    }
    d.filter((x) => x.saldo < 0.01).forEach((x) => ord.push([x.nome, m]))
    d = d.filter((x) => x.saldo >= 0.01)
  }
  return { m, juros, ok: !d.length, ord }
}

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { R, today, fmtMes, shiftMes } from './lib'

export function Money({ v, className }) {
  const mv = useMotionValue(0)
  const t = useTransform(mv, (x) => R(x))
  useEffect(() => {
    const c = animate(mv, v, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })
    return c.stop
  }, [v])
  return <motion.span className={className}>{t}</motion.span>
}

export function Password({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pw">
      <input type={show ? 'text' : 'password'} placeholder="Senha (mínimo 6 caracteres)" autoComplete={autoComplete} value={value} onChange={onChange} />
      <button type="button" className="eye" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)}>
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}

export const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -40, transition: { duration: 0.2 } } }
export const stagger = (i) => ({ transition: { delay: i * 0.06, type: 'spring', stiffness: 260, damping: 24 } })

export function MonthNav({ ym, setYm }) {
  return (
    <div className="monthnav">
      <button className="icon" aria-label="Mês anterior" onClick={() => setYm(shiftMes(ym, -1))}><ChevronLeft size={20} /></button>
      <b>{fmtMes(ym)}</b>
      <button className="icon" aria-label="Próximo mês" onClick={() => setYm(shiftMes(ym, 1))}><ChevronRight size={20} /></button>
    </div>
  )
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(value.slice(0, 7))
  const [y, m] = view.split('-').map(Number)
  const first = new Date(y, m - 1, 1).getDay()
  const n = new Date(y, m, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)]
  const day = (d) => `${view}-${String(d).padStart(2, '0')}`
  const pick = (v) => { onChange(v); setOpen(false) }
  const t = today()
  const ontem = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return iso(d) })()
  return (
    <>
      <button type="button" className="datebtn" onClick={() => { setView(value.slice(0, 7)); setOpen(true) }}>
        <CalendarDays size={18} />{value.split('-').reverse().join('/')}
      </button>
      <AnimatePresence>
        {open && <motion.div key="s" className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}
        {open && (
          <motion.div key="c" className="cal" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
            <div className="calhead">
              <button type="button" className="icon" aria-label="Ano anterior" onClick={() => setView(shiftMes(view, -12))}><ChevronsLeft size={20} /></button>
              <button type="button" className="icon" aria-label="Mês anterior" onClick={() => setView(shiftMes(view, -1))}><ChevronLeft size={20} /></button>
              <b>{fmtMes(view)}</b>
              <button type="button" className="icon" aria-label="Próximo mês" onClick={() => setView(shiftMes(view, 1))}><ChevronRight size={20} /></button>
              <button type="button" className="icon" aria-label="Próximo ano" onClick={() => setView(shiftMes(view, 12))}><ChevronsRight size={20} /></button>
            </div>
            <div className="calgrid">
              {'DSTQQSS'.split('').map((l, i) => <span key={i} className="wd">{l}</span>)}
              {cells.map((d, i) => d
                ? <button type="button" key={i} className={`day ${day(d) === value ? 'on' : ''} ${day(d) === t ? 'today' : ''}`} onClick={() => pick(day(d))}>{d}</button>
                : <span key={i} />)}
            </div>
            <div className="calfoot">
              <button type="button" className="chip" onClick={() => pick(ontem)}>Ontem</button>
              <button type="button" className="chip" onClick={() => pick(t)}>Hoje</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

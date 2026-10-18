import { useEffect, useState } from 'react'
import { useT } from '../../i18n/useT'

const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function LiveClock({ className }: { className?: string }) {
  const t = useT()
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <time className={className} aria-label={t.clockAria}>
      {now}
    </time>
  )
}

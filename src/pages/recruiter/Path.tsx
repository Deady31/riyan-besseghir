import { useContent } from '../../data/profile'
import { useT } from '../../i18n/useT'
import { Page, Row } from './Page'

/** Parcours : Shippingbo puis hackathon, en lignes lisibles d'un coup d'œil. */
export default function Path() {
  const t = useT()
  const { impact, feats } = useContent()
  const h = feats.hackathon
  const period = impact.product.facts.find(([k]) => /^(Période|Period)$/.test(k))?.[1]

  return (
    <Page title={t.recruiter.pathTitle}>
      <Row label={impact.company}>
        <p className="label text-mist">{period}</p>
        <p className="mt-1 font-semibold">{impact.role}</p>
        <p className="text-sm text-mist">{impact.context}</p>
        <ul className="mt-4 space-y-3">
          {impact.features.map((f) => (
            <li key={f.name} className="leading-snug">
              <span className="font-semibold">{f.name}.</span> {f.text}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <span className="font-semibold">{impact.roadmap.title}</span> · {impact.roadmap.badge}
          <span className="text-mist"> : {impact.roadmap.items.map((i) => i.name).join(', ')}.</span>
        </p>
      </Row>
      <Row label={t.feats.label}>
        <p className="label text-mist">
          {h.date} · {h.duration}
        </p>
        <p className="mt-1 font-semibold">{h.role}</p>
        <p className="text-sm text-mist">{h.event}</p>
        <p className="mt-3 leading-snug">{h.brief}</p>
        <ul className="mt-3 space-y-2">
          {h.delivered.map((d) => (
            <li key={d} className="flex gap-3 leading-snug">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-mist">{h.outcome}</p>
      </Row>
    </Page>
  )
}

import { Download } from 'lucide-react'
import { useContent } from '../../data/profile'
import { useT } from '../../i18n/useT'
import { Page, Row } from './Page'

/** Contact : disponibilité, puis l'e-mail en très gros (comme une phrase d'appel), puis les autres liens. */
export default function Contact() {
  const r = useT().recruiter
  const { profile } = useContent()
  return (
    <Page title={r.contactTitle}>
      <p className="flex items-center gap-2.5 text-lg font-semibold">
        <span className="size-2.5 rounded-full bg-vermilion" aria-hidden="true" />
        {profile.availability}
        <span className="font-normal text-mist">· {profile.location}</span>
      </p>
      <p className="mt-10 text-mist">{r.contactLead}</p>
      <a href={`mailto:${profile.email}`} className="display mt-2 block text-[clamp(1.6rem,0.8rem+4.6vw,4rem)] !text-signal break-all underline-offset-8 hover:underline">
        {r.contactCta2}
      </a>
      <p className="mt-2 text-lg">{profile.email}</p>
      <div className="mt-10">
        <Row label="LinkedIn">
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">
            {profile.links.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        </Row>
        <Row label="GitHub">
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">
            {profile.links.github.replace(/^https?:\/\/(www\.)?/, '')}
          </a>
        </Row>
        <Row label="CV">
          <a href={profile.links.cv} download className="inline-flex items-center gap-2 font-semibold underline underline-offset-4">
            <Download className="size-4" aria-hidden="true" />
            {r.cv}
          </a>
        </Row>
      </div>
    </Page>
  )
}

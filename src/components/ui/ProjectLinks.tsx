import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../../data/projects'
import { GithubIcon } from './BrandIcons'
import { useT } from '../../i18n/useT'

export function ProjectLinks({ project }: { project: Project }) {
  const t = useT()
  if (!project.link && !project.repo) return null
  return (
    <div className="flex flex-wrap gap-2">
      {project.link && (
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-signal hover:text-paper"
        >
          {t.links.try}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          <span className="sr-only">
            {project.title} {t.links.newTab}
          </span>
        </a>
      )}
      {project.repo && (
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-paper transition-colors hover:border-paper"
        >
          <GithubIcon className="size-4" />
          Code
          <span className="sr-only">
            {project.title} {t.links.onGithub} {t.links.newTab}
          </span>
        </a>
      )}
    </div>
  )
}

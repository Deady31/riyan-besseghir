import { Navigate, Route, Routes } from 'react-router'
import RecruiterLayout from './recruiter/Layout'
import RecruiterHome from './recruiter/Home'
import Path from './recruiter/Path'
import Skills from './recruiter/Skills'
import Contact from './recruiter/Contact'
import Agent from './recruiter/Agent'
import { ProjectDetail, ProjectsList } from './recruiter/Projects'

/**
 * Version recruteur : de vraies pages (adresse propre, bouton retour du navigateur qui marche), sans 3D ni animation lourde.
 * /recruteur (accueil), /parcours, /projets, /projets/:id, /competences, /agent, /contact.
 */
export default function Recruiter() {
  return (
    <Routes>
      <Route element={<RecruiterLayout />}>
        <Route index element={<RecruiterHome />} />
        <Route path="parcours" element={<Path />} />
        <Route path="projets" element={<ProjectsList />} />
        <Route path="projets/:id" element={<ProjectDetail />} />
        <Route path="competences" element={<Skills />} />
        <Route path="agent" element={<Agent />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/recruteur" replace />} />
      </Route>
    </Routes>
  )
}

import { ProjectsTable } from "@/components/dashboard/projects/table"

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
}

const ProjectsPage = () => {
  return <ProjectsTable />
}

export default ProjectsPage

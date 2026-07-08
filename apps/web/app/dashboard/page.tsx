import type { Metadata } from 'next'
import { DashboardContent } from './dashboard-content'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const DashboardPage = () => {
  return <DashboardContent />
}

export default DashboardPage
// Server wrapper to apply route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0

import HomeClient from './home-client'

export default function HomePage() {
  return <HomeClient />
}

// Allow static generation with revalidation for better performance
export const revalidate = 60 // Revalidate every 60 seconds

import HomeClient from './home-client'

export default function HomePage() {
  return <HomeClient />
}

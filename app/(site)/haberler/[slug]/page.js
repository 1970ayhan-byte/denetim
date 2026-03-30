import { HaberDetayPage } from '@/components/pages/HaberDetayPage'

export default function Page({ params }) {
  return <HaberDetayPage slug={params.slug} />
}

import { cookies } from 'next/headers'
import DrawerLayout from './DrawerLayout'

export default async function DrawerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const drawerOpen = cookieStore.get('drawer-open')?.value !== 'false'

  return <DrawerLayout defaultOpen={drawerOpen}>{children}</DrawerLayout>
}

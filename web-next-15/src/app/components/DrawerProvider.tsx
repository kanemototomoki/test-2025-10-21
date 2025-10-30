import { cookies } from 'next/headers'
import DrawerLayout from './DrawerLayout'
import Header from './Header'

export default async function DrawerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const drawerOpen = cookieStore.get('drawer-open')?.value !== 'false'
  const theme = cookieStore.get('theme')?.value || 'light'

  return (
    <DrawerLayout defaultOpen={drawerOpen} defaultTheme={theme}>
      {children}
    </DrawerLayout>
  )
}

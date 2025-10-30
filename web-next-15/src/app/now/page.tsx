import { Suspense } from 'react'
import { View } from './View'
import { getNow } from './get-now.server'

export default function NowPage() {
  const nowPromise = getNow()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <View nowPromise={nowPromise} />
    </Suspense>
  )
}

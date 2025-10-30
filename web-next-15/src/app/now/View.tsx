import { FC, use } from 'react'

type Props = {
  nowPromise: Promise<{
    timestamp: string
  }>
}
export const View: FC<Props> = ({ nowPromise }) => {
  const now = use(nowPromise)

  return <div>レスポンスの時刻: {now.timestamp}</div>
}

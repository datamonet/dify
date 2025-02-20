import React from 'react'
import ChartView from './chartView'
import CardView from './cardView'
import TracingPanel from './tracing/panel'
import ApikeyInfoPanel from '@/app/components/app/overview/apikey-info-panel'
import { getUserInfo } from '@/app/api/user'

export type IDevelopProps = {
  params: { appId: string }
}

const Overview = async ({
  params: { appId },
}: IDevelopProps) => {
  const userProfile = await getUserInfo()

  return (
    <div className="h-full px-4 sm:px-16 py-6 overflow-scroll">
      <ApikeyInfoPanel />
      <TracingPanel />
      {/* takin command: 管理员可以使用api，隐藏CardView */}
      {userProfile?.role === 'admin' && (
        <CardView appId={appId} />
      )}
      <CardView appId={appId} />
      <ChartView appId={appId} />
    </div>
  )
}

export default Overview

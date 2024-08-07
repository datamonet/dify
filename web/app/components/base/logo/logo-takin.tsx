import type { FC } from 'react'
import classNames from 'classnames'

type LogoSiteProps = {
  className?: string
}

const LogoSite: FC<LogoSiteProps> = ({
  className,
}) => {
  return (
    <img
      src='/logo/logo-takin-with-text.svg'
      className={classNames('block w-auto h-8', className)}
      alt='logo'
    />
  )
}

export default LogoSite

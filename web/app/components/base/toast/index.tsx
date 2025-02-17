'use client'
import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiErrorWarningFill,
  RiInformation2Fill,
} from '@remixicon/react'
import { createContext, useContext } from 'use-context-selector'
import ActionButton from '@/app/components/base/action-button'
import classNames from '@/utils/classnames'

export type IToastProps = {
  type?: 'success' | 'error' | 'warning' | 'info'
  size?: 'md' | 'sm'
  duration?: number
  message: string
  children?: ReactNode
  onClose?: () => void
  className?: string
}
type IToastContext = {
  notify: (props: IToastProps) => void
  close: () => void
}

export const ToastContext = createContext<IToastContext>({} as IToastContext)
export const useToastContext = () => useContext(ToastContext)
const Toast = ({
  type = 'info',
  size = 'md',
  message,
  children,
  className,
}: IToastProps) => {
  const { close } = useToastContext()
  // sometimes message is react node array. Not handle it.
  if (typeof message !== 'string')
    return null

  return <div className={classNames(
    className,
    'fixed rounded-md p-4 my-4 mx-8 z-[9999]',
    'top-12',
    'left-1/2', // 将元素的左边缘定位到视口的50%
    '-translate-x-1/2', // 将元素向左移动自身宽度的50%，实现水平居中 // takin command: 错误弹窗放在中间
    type === 'success' ? 'bg-green-50' : '',
    type === 'error' ? 'bg-red-50' : '',
    type === 'warning' ? 'bg-yellow-50' : '',
    type === 'info' ? 'bg-blue-50' : '',
  )}>
    <div className={`absolute inset-0 opacity-40 ${
      (type === 'success' && 'bg-[linear-gradient(92deg,rgba(23,178,106,0.25)_0%,rgba(255,255,255,0.00)_100%)]')
      || (type === 'warning' && 'bg-[linear-gradient(92deg,rgba(247,144,9,0.25)_0%,rgba(255,255,255,0.00)_100%)]')
      || (type === 'error' && 'bg-[linear-gradient(92deg,rgba(240,68,56,0.25)_0%,rgba(255,255,255,0.00)_100%)]')
      || (type === 'info' && 'bg-[linear-gradient(92deg,rgba(11,165,236,0.25)_0%,rgba(255,255,255,0.00)_100%)]')
    }`}
    />
    <div className={`flex ${size === 'md' ? 'gap-1' : 'gap-0.5'}`}>
      <div className={`flex justify-center items-center ${size === 'md' ? 'p-0.5' : 'p-1'}`}>
        {type === 'success' && <RiCheckboxCircleFill className={`${size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} text-text-success`} aria-hidden="true" />}
        {type === 'error' && <RiErrorWarningFill className={`${size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} text-text-destructive`} aria-hidden="true" />}
        {type === 'warning' && <RiAlertFill className={`${size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} text-text-warning-secondary`} aria-hidden="true" />}
        {type === 'info' && <RiInformation2Fill className={`${size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} text-text-accent`} aria-hidden="true" />}
      </div>
      <div className={`flex py-1 ${size === 'md' ? 'px-1' : 'px-0.5'} flex-col items-start gap-1 flex-grow`}>
        <div className='text-text-primary system-sm-semibold'>{message}</div>
        {children && <div className='text-text-secondary system-xs-regular'>
          {children}
        </div>
        }
      </div>
      <ActionButton className='z-[1000]' onClick={close}>
        <RiCloseLine className='w-4 h-4 flex-shrink-0 text-text-tertiary' />
      </ActionButton>
    </div>
  </div>
}

export const ToastProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const placeholder: IToastProps = {
    type: 'info',
    message: 'Toast message',
    duration: 6000,
  }
  const [params, setParams] = React.useState<IToastProps>(placeholder)
  // takin command:停留时间长一点
  const defaultDuring = 6000
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mounted) {
      setTimeout(() => {
        setMounted(false)
      }, params.duration || defaultDuring)
    }
  }, [defaultDuring, mounted, params.duration])

  return <ToastContext.Provider value={{
    notify: (props) => {
      setMounted(true)
      setParams(props)
    },
    close: () => setMounted(false),
  }}>
    {mounted && <Toast {...params} />}
    {children}
  </ToastContext.Provider>
}

Toast.notify = ({
  type,
  size = 'md',
  message,
  duration,
  className,
}: Pick<IToastProps, 'type' | 'size' | 'message' | 'duration' | 'className'>) => {
  // takin command:停留时间长一点
  const defaultDuring = 6000
  // const defaultDuring = (type === 'success' || type === 'info') ? 3000 : 6000
  if (typeof window === 'object') {
    const holder = document.createElement('div')
    const root = createRoot(holder)

    root.render(
      <ToastContext.Provider value={{
        notify: () => {},
        close: () => {
          if (holder) {
            root.unmount()
            holder.remove()
          }
        },
      }}>
        <Toast type={type} size={size} message={message} duration={duration} className={className} />
      </ToastContext.Provider>,
    )
    document.body.appendChild(holder)
    setTimeout(() => {
      if (holder) {
        root.unmount()
        holder.remove()
      }
    }, duration || defaultDuring)
  }
}

export default Toast

'use client'
import type { FC } from 'react'
import React from 'react'
import { RiHeartLine, RiShapesLine } from '@remixicon/react'
import cn from '@/utils/classnames'
import type { AppCategory } from '@/models/explore'
import { ThumbsUp } from '@/app/components/base/icons/src/vender/line/alertsAndFeedback'

export type ICategoryProps = {
  className?: string
  value: string
  onChange: (value: AppCategory | string) => void
  /**
   * default value for search param 'category' in en
   */
  // allCategoriesEn: string
}

const Category: FC<ICategoryProps> = ({
  className,
  value,
  onChange,
  // allCategoriesEn,
}) => {
  const itemClassName = (isSelected: boolean) => cn(
    'flex items-center px-3 py-[7px] h-[32px] rounded-lg border-[0.5px] border-transparent text-gray-700 font-medium leading-[18px] cursor-pointer hover:bg-gray-200',
    isSelected && 'bg-white border-gray-200 shadow-xs text-primary-600 hover:bg-white',
  )

  return (
    <div className={cn(className, 'flex space-x-1 text-[13px] flex-wrap')}>
      <div
        className={itemClassName(value === 'recommended')}
        onClick={() => onChange('recommended')}
      >
        <ThumbsUp className="mr-1 w-3.5 h-3.5" />
        Recommended
      </div>
      {/* Takin command:为分类增加一个community */}
      <div
        className={itemClassName(value === 'community')}
        onClick={() => onChange('community')}
      >
        <RiShapesLine className="mr-1 w-3.5 h-3.5" />
        Community
      </div>
      <div
        className={itemClassName(value === 'favourite')}
        onClick={() => onChange('favourite')}
      >
        <RiHeartLine className="mr-1 w-3.5 h-3.5" />
        Favourite
      </div>
      {/* {list.filter(name => name !== allCategoriesEn).map(name => (
        <div
          key={name}
          className={itemClassName(name === value)}
          onClick={() => onChange(name)}
        >
          {categoryI18n[name] ? t(`explore.category.${name}`) : name}
        </div>
      ))} */}
    </div>
  )
}

export default React.memo(Category)

import React from 'react'
import { User, Building2 } from 'lucide-react'
import { motion } from 'motion/react'

interface PricingTabsProps {
  activeTab: 'company' | 'candidate'
  onChange: (tab: 'company' | 'candidate') => void
  showTabs: boolean
}

export const PricingTabs: React.FC<PricingTabsProps> = ({ activeTab, onChange, showTabs }) => {
  if (!showTabs) return null

  return (
    <div className="flex justify-center mb-16">
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 inline-flex relative w-full max-w-md">
        <button
          onClick={() => onChange('candidate')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === 'candidate'
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-500 hover:text-slate-950'
          }`}
        >
          <User className="w-4 h-4" />
          Dành cho Ứng Viên
        </button>
        <button
          onClick={() => onChange('company')}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === 'company'
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-500 hover:text-slate-950'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Dành cho Doanh Nghiệp
        </button>

        {/* Slider background */}
        <motion.div
          layoutId="activeTabSlider"
          className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm border border-slate-200/30"
          style={{
            left: activeTab === 'candidate' ? '6px' : '50%',
            width: 'calc(50% - 6px)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  )
}

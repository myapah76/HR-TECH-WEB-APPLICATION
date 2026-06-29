import React from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export interface FaqItem {
  q: string
  a: string
}

interface PricingFaqProps {
  faqs: FaqItem[]
  openFaq: number | null
  onToggleFaq: (index: number | null) => void
}

export const PricingFaq: React.FC<PricingFaqProps> = ({ faqs, openFaq, onToggleFaq }) => {
  return (
    <div className="mt-28 max-w-3xl mx-auto border-t border-slate-200/80 pt-20 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Câu hỏi thường gặp
        </h2>
        <p className="text-slate-500 font-medium mt-3">
          Giải đáp nhanh những thắc mắc của bạn về gói dịch vụ
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = openFaq === i
          return (
            <div
              key={i}
              className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300"
            >
              <button
                onClick={() => onToggleFaq(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 text-base cursor-pointer select-none"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ml-4 ${
                    isOpen ? 'rotate-180 text-indigo-650' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

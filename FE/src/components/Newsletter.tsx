"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle, Mail, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';

interface NewsletterProps {
  }

export default function Newsletter({}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-white py-1" id="newsletter-subscription-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner with Warm Bronze / Amber Gradient */}
        <div 
          className="relative rounded-2xl overflow-hidden bg-radial from-amber-900/90 via-amber-950 to-neutral-900 px-6 py-12 text-center shadow-xl border border-amber-80 *md:px-12"
          id="newsletter-banner"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(146, 64, 14, 0.95) 0%, rgba(24, 24, 27, 0.98) 100%)`
          }}
        >
          
          {/* Subtle mesh background detail */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 max-w-2xl mx-auto" id="newsletter-content">
            <h3 className="text-xl sm:text-2xl font-black text-rose-100 tracking-tight leading-snug">
              {'Đăng ký theo dõi để nhận cập nhật về cơ hội việc làm mới và phù hợp nhất'}
            </h3>
            
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="subscribe-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="mt-8 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto"
                  id="form-subscribe-email"
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500/80" />
                    <input
                      type="email"
                      required
                      placeholder={'Nhập địa chỉ email của bạn...'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/10 text-white placeholder-amber-200/50 text-sm font-semibold rounded-xl pl-12 pr-4 py-3.5 border border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 backdrop-blur-md transition-colors"
                      id="input-subscribe-email"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-450 bg-teal-500 hover:bg-teal-400 text-white font-black text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl shadow-lg hover:shadow-teal-500/20 active:scale-98 transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                    id="btn-subscribe"
                  >
                    <Send className="h-4 w-4" />
                    <span>{'ĐĂNG KÝ NGAY'}</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="subscribe-thanks"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl max-w-md mx-auto flex items-center justify-center gap-3 text-emerald-300"
                  id="subscription-success-box"
                >
                  <CheckCircle className="h-6 w-6 shrink-0 text-emerald-400" />
                  <div className="text-left">
                    <p className="font-extrabold text-sm text-white">{'Đăng ký thành công!'}</p>
                    <p className="text-xs text-emerald-200/85">
                      {'Cộng đồng HR - Tech sẽ gửi cho bạn các tin tuyển dụng phù hợp sớm nhất.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}

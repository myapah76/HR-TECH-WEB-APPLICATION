/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link"
import { Code, Briefcase, Mail, MapPin, Phone, Share2 } from "lucide-react"

export default function Footer() {
  return (
    <footer
      className="bg-gray-905 border-t border-gray-150 bg-slate-900 dark:bg-slate-950 text-slate-300 py-12"
      id="site-footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid divided by cols */}
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-800 pb-10"
          id="footer-top-grid"
        >
          {/* Logo & Info column on Left */}
          <div
            className="col-span-2 flex flex-col gap-4 text-left"
            id="footer-col-company"
          >
            <Link
              href="/"
              className="text-xl font-black text-white tracking-tight hover:opacity-90 transition-opacity"
            >
              HR <span className="text-blue-400 font-bold">- Tech</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              Leading the human resources industry with intelligent match
              algorithms, premium candidate pipelines, and comprehensive salary
              insights.
            </p>
            <div
              className="flex flex-col gap-2 mt-2 text-xs font-semibold text-slate-400"
              id="footer-contacts"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" /> 24th
                Floor, Keangnam Landmark, Tu Liem, Hanoi
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-blue-400" /> +84 24 7300
                7999
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />{" "}
                contact@nexushr.vn
              </span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-4" id="f-col-col-cand">
            <h4 className="text-xs font-black tracking-widest text-white uppercase bg-slate-800/50 py-1 px-2.5 rounded-sm self-start">
              FOR CANDIDATES
            </h4>
            <ul
              className="flex flex-col gap-2 text-xs text-slate-400"
              id="f-links-col-cand"
            >
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-cand-0"
                >
                  Latest Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/salary-guide"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-cand-1"
                >
                  VietnamSalary
                </Link>
              </li>
              <li>
                <Link
                  href="/handbook"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-cand-2"
                >
                  Career Handbook
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-cand-3"
                >
                  Events
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4" id="f-col-col-rec">
            <h4 className="text-xs font-black tracking-widest text-white uppercase bg-slate-800/50 py-1 px-2.5 rounded-sm self-start">
              FOR RECRUITERS
            </h4>
            <ul
              className="flex flex-col gap-2 text-xs text-slate-400"
              id="f-links-col-rec"
            >
              <li>
                <Link
                  href="/login?role=recruiter"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-rec-0"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-rec-1"
                >
                  Find Talent
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-rec-2"
                >
                  Products & Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-rec-3"
                >
                  Get a Quote
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4" id="f-col-col-hlp">
            <h4 className="text-xs font-black tracking-widest text-white uppercase bg-slate-800/50 py-1 px-2.5 rounded-sm self-start">
              HELP CENTER
            </h4>
            <ul
              className="flex flex-col gap-2 text-xs text-slate-400"
              id="f-links-col-hlp"
            >
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-hlp-0"
                >
                  About HR - Tech
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-hlp-1"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-hlp-2"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-hlp-3"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4" id="f-col-col-ptr">
            <h4 className="text-xs font-black tracking-widest text-white uppercase bg-slate-800/50 py-1 px-2.5 rounded-sm self-start">
              PARTNER WEBSITES
            </h4>
            <ul
              className="flex flex-col gap-2 text-xs text-slate-400"
              id="f-links-col-ptr"
            >
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-ptr-0"
                >
                  VieclamIT
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-ptr-1"
                >
                  TalentNetwork
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-400 hover:underline transition-colors font-semibold"
                  id="f-link-url-col-ptr-2"
                >
                  VietnamWork Hub
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Base bottom details */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-bold"
          id="footer-bottom-row"
        >
          <p>
            © 2026 HR - Tech Vietnam Joint Stock Company. All rights reserved.
          </p>
          <div className="flex gap-4 mt-3 sm:mt-0" id="footer-socials">
            <a
              href="#"
              className="hover:text-white transition-colors"
              id="social-linkedin"
            >
              <Briefcase className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              id="social-twitter"
            >
              <Share2 className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              id="social-github"
            >
              <Code className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

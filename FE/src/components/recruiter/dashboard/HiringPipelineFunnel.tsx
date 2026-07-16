interface HiringPipelineFunnelProps {
  submitted: number
  screening: number
  interview: number
  offer: number
  totalApps: number
  isLoading?: boolean
}

export default function HiringPipelineFunnel({
  submitted,
  screening,
  interview,
  offer,
  totalApps,
  isLoading,
}: HiringPipelineFunnelProps) {
  const getPercentage = (count: number) => {
    if (totalApps === 0) return 0
    return Math.round((count / totalApps) * 100)
  }

  const candidatePipeline = [
    {
      stage: 'Ứng tuyển mới',
      count: submitted,
      percentage: getPercentage(submitted),
      color: 'bg-blue-500',
    },
    {
      stage: 'Sàng lọc CV',
      count: screening,
      percentage: getPercentage(screening),
      color: 'bg-amber-500',
    },
    {
      stage: 'Phỏng vấn',
      count: interview,
      percentage: getPercentage(interview),
      color: 'bg-indigo-500',
    },
    {
      stage: 'Nhận việc (Offer)',
      count: offer,
      percentage: getPercentage(offer),
      color: 'bg-emerald-500',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-900">Phễu ứng viên</h2>
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            Quy trình tuyển dụng
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {candidatePipeline.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-100/60 bg-slate-50/20 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    {p.stage}
                  </span>
                  <span className="text-xs font-black text-slate-800 bg-white border border-slate-150 px-2 py-0.5 rounded-md shadow-xs">
                    {p.count} hồ sơ
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-700">
                    <span>Tỷ lệ phân phối</span>
                    <span>{p.percentage}%</span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${p.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

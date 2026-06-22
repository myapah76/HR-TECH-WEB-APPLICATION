import React from 'react'
import { Button } from '@/src/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { CvDetailResponse } from '@/src/types/cv'
import { CvExtractionStatus } from '@/src/enums/cv.enum'

interface CvDetailModalProps {
  viewCv: CvDetailResponse | null
  loadingDetail: boolean
  setViewCvId: (id: string | null) => void
}

export function CvDetailModal({ viewCv, loadingDetail, setViewCvId }: CvDetailModalProps) {
  return (
    <>
      {viewCv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setViewCvId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-300 h-[95vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{viewCv.title}</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Trạng thái AI:{' '}
                  {viewCv.extractionStatus === CvExtractionStatus.COMPLETED ? (
                    <span className="text-emerald-600">Đã phân tích xong</span>
                  ) : viewCv.extractionStatus === CvExtractionStatus.PROCESSING ? (
                    <span className="text-blue-600">Đang phân tích</span>
                  ) : (
                    <span className="text-amber-600">Chờ phân tích</span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewCvId(null)}
                className="hover:bg-slate-200 rounded-full h-10 w-10"
              >
                <X className="w-6 h-6 text-slate-500" />
              </Button>
            </div>
            <div className="flex-1 bg-slate-100 p-4">
              {viewCv.fileUrl ? (
                <iframe
                  src={viewCv.fileUrl}
                  className="w-full h-full rounded-xl border border-slate-300 shadow-inner"
                  title="CV PDF Viewer"
                />
              ) : (
                <div className="text-slate-500 bg-white p-8 rounded-xl border border-slate-200 text-center h-full flex items-center justify-center font-medium">
                  Không có link file hiển thị
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="font-bold text-slate-700">Đang tải dữ liệu CV...</span>
          </div>
        </div>
      )}
    </>
  )
}

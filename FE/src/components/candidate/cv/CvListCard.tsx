import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { FileSearch, Loader2 } from 'lucide-react'
import { CvSummaryResponse } from '@/src/types/cv'
import { CvExtractionStatus } from '@/src/enums/cv.enum'

import { CvListCardProps } from '@/src/types/cv'
import { formatDateTime } from '@/src/utils'

export function CvListCard({
  cvs,
  editingCvId,
  setEditingCvId,
  editTitle,
  setEditTitle,
  handleUpdateTitle,
  handleViewCv,
  handleSetPrimary,
  handleDelete,
}: CvListCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white h-fit">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-slate-800">Danh sách Hồ sơ</CardTitle>
        <CardDescription>Quản lý các CV đã tải lên của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {cvs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Bạn chưa tải lên hồ sơ nào.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col gap-3"
              >
                {/* Dòng 1: Tên CV và các nhãn trạng thái */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {editingCvId === cv.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleUpdateTitle(cv.id, cv.title)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle(cv.id, cv.title)}
                        autoFocus
                        className="h-8 max-w-[200px] font-bold"
                      />
                    ) : (
                      <h3
                        className="font-bold text-slate-800 text-lg cursor-pointer hover:text-blue-600 transition-colors border-b border-dashed border-slate-300 truncate max-w-[200px] sm:max-w-[300px]"
                        onClick={() => {
                          setEditingCvId(cv.id)
                          setEditTitle(cv.title)
                        }}
                        title="Nhấn để đổi tên"
                      >
                        {cv.title}
                      </h3>
                    )}
                    {cv.isPrimary && (
                      <span className="shrink-0 h-7 px-2.5 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">
                        Mặc định
                      </span>
                    )}
                    {cv.extractionStatus === CvExtractionStatus.PENDING ||
                    cv.extractionStatus === CvExtractionStatus.PROCESSING ? (
                      <span className="shrink-0 h-7 px-2.5 flex items-center justify-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-md uppercase tracking-wider">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang phân tích
                      </span>
                    ) : cv.extractionStatus === CvExtractionStatus.COMPLETED ? (
                      <span className="shrink-0 h-7 px-2.5 flex items-center justify-center bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md uppercase tracking-wider">
                        Đã phân tích
                      </span>
                    ) : (
                      <span className="shrink-0 h-7 px-2.5 flex items-center justify-center bg-rose-100 text-rose-700 text-xs font-bold rounded-md uppercase tracking-wider">
                        Lỗi phân tích
                      </span>
                    )}
                  </div>
                </div>

                {/* Dòng 2: Thời gian và Các nút hành động */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-1">
                  <p className="text-xs text-slate-500">
                    Tải lên: {formatDateTime(cv.createdAt)}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 flex-1 sm:flex-none px-3"
                      onClick={() => handleViewCv(cv.id)}
                    >
                      <FileSearch className="w-4 h-4 mr-1.5" /> XEM NỘI DUNG
                    </Button>
                    {!cv.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(cv.id)}
                        className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 flex-1 sm:flex-none px-3"
                      >
                        ĐẶT MẶC ĐỊNH
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cv.id)}
                      className="h-8 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:text-rose-700 flex-1 sm:flex-none shadow-none px-3"
                    >
                      XÓA
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

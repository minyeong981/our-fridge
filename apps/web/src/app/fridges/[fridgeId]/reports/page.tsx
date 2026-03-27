'use client'

import { useParams } from 'next/navigation'
import { Flag } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReports, updateReportStatus } from '@our-fridge/api'
import { timeAgo } from '@our-fridge/shared'
import { cn } from '@/lib/utils'
import type { ReportStatus } from '@our-fridge/api'

const STATUS_LABEL: Record<ReportStatus, string> = {
  pending: '대기',
  resolved: '처리됨',
  dismissed: '기각',
}

const STATUS_STYLE: Record<ReportStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-600',
  resolved: 'bg-green-50 text-green-600',
  dismissed: 'bg-neutral-100 text-neutral-400',
}

const TARGET_LABEL: Record<string, string> = {
  post: '게시글',
  comment: '댓글',
}

export default function ReportsPage() {
  const { fridgeId } = useParams<{ fridgeId: string }>()
  const queryClient = useQueryClient()

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports', fridgeId],
    queryFn: () => getReports(fridgeId),
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) =>
      updateReportStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', fridgeId] }),
  })

  const pending = reports.filter((r) => r.status === 'pending')
  const resolved = reports.filter((r) => r.status !== 'pending')

  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-16">
          <Flag size={40} className="text-neutral-200" />
          <p className="text-base font-semibold text-neutral-500">신고 내역이 없어요</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-lg mx-auto w-full px-4 py-4 pb-20 flex flex-col gap-5">
            {pending.length > 0 && (
              <section>
                <p className="text-[11px] font-bold text-neutral-400 tracking-widest mb-2">
                  미처리 ({pending.length})
                </p>
                <div className="flex flex-col gap-2">
                  {pending.map((r) => (
                    <ReportCard
                      key={r.id}
                      report={r}
                      onResolve={() => changeStatus({ id: r.id, status: 'resolved' })}
                      onDismiss={() => changeStatus({ id: r.id, status: 'dismissed' })}
                    />
                  ))}
                </div>
              </section>
            )}
            {resolved.length > 0 && (
              <section>
                <p className="text-[11px] font-bold text-neutral-400 tracking-widest mb-2">
                  처리 완료 ({resolved.length})
                </p>
                <div className="flex flex-col gap-2">
                  {resolved.map((r) => (
                    <ReportCard key={r.id} report={r} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ReportCard({
  report,
  onResolve,
  onDismiss,
}: {
  report: { id: string; targetType: string; reason: string; status: ReportStatus; createdAt: string }
  onResolve?: () => void
  onDismiss?: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 px-4 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-neutral-500">
          {TARGET_LABEL[report.targetType] ?? report.targetType}
        </span>
        <span className="text-neutral-200">·</span>
        <span className="text-xs text-neutral-400">{timeAgo(report.createdAt)}</span>
        <span
          className={cn(
            'ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full',
            STATUS_STYLE[report.status],
          )}
        >
          {STATUS_LABEL[report.status]}
        </span>
      </div>
      <p className="text-sm text-neutral-700 font-semibold">{report.reason}</p>
      {report.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onResolve}
            className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold"
          >
            처리 완료
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 py-2 rounded-xl bg-neutral-100 text-neutral-500 text-xs font-bold"
          >
            기각
          </button>
        </div>
      )}
    </div>
  )
}

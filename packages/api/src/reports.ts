import { supabase } from './client'

export type ReportTargetType = 'post' | 'comment'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  fridgeId: string
  reason: string
  status: ReportStatus
  createdAt: string
}

export interface CreateReportInput {
  targetType: ReportTargetType
  targetId: string
  fridgeId: string
  reason: string
}

export async function createReport(input: CreateReportInput): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    fridge_id: input.fridgeId,
    reason: input.reason,
  })
  if (error) throw error
}

export async function getReports(fridgeId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('fridge_id', fridgeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    reporterId: r.reporter_id,
    targetType: r.target_type,
    targetId: r.target_id,
    fridgeId: r.fridge_id,
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
  }))
}

export async function updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
  const { error } = await supabase.from('reports').update({ status }).eq('id', reportId)
  if (error) throw error
}

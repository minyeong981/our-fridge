export type PostCategory = '나눔/공유' | '이의 제기/신고' | '정보/메시지'

export const CATEGORY_STYLE: Record<PostCategory, string> = {
  '나눔/공유': 'bg-green-50 text-green-600',
  '이의 제기/신고': 'bg-red-50 text-red-500',
  '정보/메시지': 'bg-primary-50 text-primary',
}

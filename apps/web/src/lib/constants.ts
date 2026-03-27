export type { PostCategory } from '@our-fridge/shared'
import type { PostCategory } from '@our-fridge/shared'

export const CATEGORY_STYLE: Record<PostCategory, string> = {
  정보: 'bg-primary-50 text-primary',
  '나눔/공유': 'bg-green-50 text-green-600',
  잡담: 'bg-secondary-50 text-secondary',
  '이의 제기/신고': 'bg-red-50 text-red-500',
}

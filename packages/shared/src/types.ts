// ─── Fridge ───────────────────────────────────────────────────────────────────

export type Fridge = {
  id: string
  emoji: string | null
  name: string
  location: string | null
  description: string | null
  rules: string | null
  notice: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export type CreateFridgeInput = Pick<Fridge, 'name'> & {
  emoji?: string | null
  location?: string | null
  description?: string | null
  rules?: string | null
}

export type UpdateFridgeInput = Partial<
  Pick<Fridge, 'name' | 'emoji' | 'location' | 'description' | 'rules' | 'notice'>
>

// ─── Membership ───────────────────────────────────────────────────────────────

export type MemberRole = 'owner' | 'admin' | 'member'

export type Membership = {
  id: string
  userId: string
  fridgeId: string
  role: MemberRole
  createdAt: string
}

// ─── Item ─────────────────────────────────────────────────────────────────────

export type ItemStatus = 'active' | 'consumed' | 'discarded' | 'cleaned'

export type StorageType = '냉장' | '냉동'

export type Item = {
  id: string
  fridgeId: string
  name: string
  storageType: StorageType
  registeredBy: string
  expireDate: string | null
  memo: string | null
  imageUrl: string | null
  status: ItemStatus
  createdAt: string
  updatedAt: string
}

export type CreateItemInput = Pick<Item, 'fridgeId' | 'name'> & {
  storageType?: StorageType
  expireDate?: string | null
  memo?: string | null
  imageUrl?: string | null
}

export type UpdateItemInput = Partial<
  Pick<Item, 'name' | 'storageType' | 'expireDate' | 'memo' | 'imageUrl' | 'status'>
>

// ─── ItemLog ──────────────────────────────────────────────────────────────────

export type ItemLogAction = 'consume' | 'discard' | 'lost' | 'admin_clean'

export type ItemLog = {
  id: string
  itemId: string
  action: ItemLogAction
  performedBy: string | null
  note: string | null
  createdAt: string
}

export type CreateItemLogInput = Pick<ItemLog, 'itemId' | 'action'> & {
  note?: string | null
}

// ─── Community ────────────────────────────────────────────────────────────────

export type PostCategory = '정보' | '나눔/공유' | '잡담' | '이의 제기/신고'

export type Post = {
  id: string
  fridgeId: string
  authorId: string
  authorName: string | null
  authorAvatarUrl: string | null
  isAnonymous: boolean
  category: PostCategory
  title: string
  content: string
  imageUrls: string[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export type CreatePostInput = {
  fridgeId: string
  category: PostCategory
  title: string
  content: string
  isAnonymous?: boolean
  imageUrls?: string[]
}

export type UpdatePostInput = Partial<
  Pick<Post, 'category' | 'title' | 'content' | 'isAnonymous' | 'imageUrls'>
>

export type Comment = {
  id: string
  postId: string
  authorId: string
  authorName: string | null
  authorAvatarUrl: string | null
  isAnonymous: boolean
  parentId: string | null
  content: string
  likesCount: number
  isLiked: boolean
  replies: Comment[]
  createdAt: string
  updatedAt: string
}

export type CreateCommentInput = {
  postId: string
  content: string
  parentId?: string
  isAnonymous?: boolean
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export type UpsertProfileInput = {
  name?: string | null
  avatarUrl?: string | null
}

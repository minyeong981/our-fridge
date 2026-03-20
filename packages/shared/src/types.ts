// ─── Space ────────────────────────────────────────────────────────────────────

export type Space = {
  id: string
  name: string
  description: string | null
  defaultExpireDays: number | null
  cleanupMessage: string | null
  createdBy: string
  createdAt: string
}

export type CreateSpaceInput = Pick<Space, 'name'> & {
  description?: string | null
  defaultExpireDays?: number | null
  cleanupMessage?: string | null
}

export type UpdateSpaceInput = Partial<Omit<CreateSpaceInput, never>>

// ─── Fridge ───────────────────────────────────────────────────────────────────

export type Fridge = {
  id: string
  spaceId: string
  name: string
  createdAt: string
}

export type CreateFridgeInput = Pick<Fridge, 'spaceId' | 'name'>

// ─── Membership ───────────────────────────────────────────────────────────────

export type MemberRole = 'owner' | 'admin' | 'member'

export type Membership = {
  id: string
  userId: string
  spaceId: string
  role: MemberRole
  createdAt: string
}

// ─── Item ─────────────────────────────────────────────────────────────────────

export type ItemStatus = 'active' | 'consumed' | 'discarded' | 'cleaned'

export type Item = {
  id: string
  fridgeId: string
  name: string
  ownerName: string
  ownerId: string | null
  isAnonymous: boolean
  expireDate: string | null
  memo: string | null
  imageUrl: string | null
  status: ItemStatus
  createdAt: string
  updatedAt: string
}

export type CreateItemInput = Pick<Item, 'fridgeId' | 'name' | 'ownerName' | 'isAnonymous'> & {
  expireDate?: string | null
  memo?: string | null
  imageUrl?: string | null
}

export type UpdateItemInput = Partial<
  Pick<Item, 'name' | 'ownerName' | 'expireDate' | 'memo' | 'imageUrl' | 'status'>
>

// ─── ItemLog ──────────────────────────────────────────────────────────────────

export type ItemLogAction = 'consume' | 'take' | 'discard' | 'admin_clean'

export type ItemLog = {
  id: string
  itemId: string
  action: ItemLogAction
  performedBy: string
  note: string | null
  createdAt: string
}

export type CreateItemLogInput = Pick<ItemLog, 'itemId' | 'action'> & {
  note?: string | null
}

import { redirect } from 'next/navigation'
import { LoginError } from './LoginError'

// error 파라미터 없으면 서버에서 즉시 리다이렉트 (클라이언트 플래시 없음)
export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string }>
}) {
  const { error } = await searchParams
  if (!error) {
    redirect('/fridges')
  }

  return <LoginError error={error} />
}

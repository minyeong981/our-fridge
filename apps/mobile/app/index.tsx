import { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { getItemsByFridge } from '@our-fridge/api'
import type { Item } from '@our-fridge/shared'
import { formatDate, isExpired, isExpiringSoon } from '@our-fridge/shared'

function getExpireColor(date: string) {
  if (isExpired(date)) return 'text-red-500'
  if (isExpiringSoon(date)) return 'text-orange-400'
  return 'text-gray-400'
}

const FRIDGE_ID = 'your-fridge-id' // 실제 fridge ID로 교체

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getItemsByFridge(FRIDGE_ID)
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Text className="mt-10 text-center">로딩 중...</Text>
  if (error) return <Text className="mt-10 text-center text-red-500">에러: {error}</Text>

  return (
    <View className="flex-1 bg-white px-6 pt-6">
      <Text className="mb-4 text-2xl font-bold">우리의 냉장고</Text>
      {items.length === 0 ? (
        <Text className="mt-4 text-gray-400">냉장고가 비어있습니다.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="border-b border-gray-100 py-3">
              <Text className="text-base">{item.name}</Text>
              <Text className="mt-0.5 text-sm text-gray-400">{item.ownerName}</Text>
              {item.expireDate && (
                <Text className={`mt-0.5 text-xs ${getExpireColor(item.expireDate)}`}>
                  {formatDate(item.expireDate)}
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  )
}

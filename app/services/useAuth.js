import { useAuth } from '@clerk/clerk-expo'
import { Text } from 'react-native'

export default function UseAuthExample() {
  const { isLoaded, userId, sessionId } = useAuth()

  if (!isLoaded || !userId) {
    return null
  }

  return (
    <Text>
      Hello, {userId} your current active session is {sessionId}
    </Text>
  )
}
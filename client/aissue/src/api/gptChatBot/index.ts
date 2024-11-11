import { privateAPI } from '@/api/axios'

const postChatBot = async (message: string) => {
  const res = await privateAPI.post('/chatbot', { message })
  return res.data.result.chatbotMessage
}

export { postChatBot }

import { privateAPI } from '@/api/axios'

const getChattingList = async (jiraProjectKey: string) => {
  const res = await privateAPI.get(`/chat/${jiraProjectKey}`)
  return res.data
}

export { getChattingList }

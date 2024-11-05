import { privateAPI } from '@/api/axios'

const getProjectList = async () => {
  const res = await privateAPI.get('/member/projects')
  return res.data.result.projectIds
}

export { getProjectList }

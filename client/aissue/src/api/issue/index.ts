import { privateAPI } from '@/api/axios'
import { EpicData } from '@/components/(Modal)/EpicModal/page'

interface IssueRequest {
  project: string,
  issues: EpicData[]
}

const postIssues = async (issueRequest: IssueRequest) => {
  const res = await privateAPI.post('/issues', issueRequest)
  return res.data
}

const getEpics = async (jiraProjectKey: string) => {
  const res = await privateAPI.get(`/issues/sprint`, {
    params: {
      project: jiraProjectKey
    }
  });
  return res.data?.result;
}

export { postIssues, getEpics }

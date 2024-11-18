// src/api/project.ts
import { privateAPI } from '@/api/axios'

const getProjectList = async () => {
  const res = await privateAPI.get('/member/projects')
  return res.data.result.projectIds
}

interface Task {
  title: string
  start: Date
  end: Date
}

interface Story {
  id: number
  key: string
  title: string
  tasks: Task[]
  status: 'To Do' | 'In Progress' | 'Done' // 특정 값만 허용하도록 제한
}

interface Epic {
  id: number
  key: string
  summary: string
  description: string
  priority: string
  startAt: string
  endAt: string
}

// 추가된 인터페이스 정의
interface Subtask {
  summary: string
  startAt: string | null
  endAt: string | null
}

interface Parent {
  id: number
  key: string
  summary: string
  priority: string
  status: string
  issuetype: string
  startAt: string | null
  endAt: string | null
}

interface Issue {
  id: number
  key: string
  summary: string
  subtasks: Subtask[]
  status: 'To Do' | 'In Progress' | 'Done' // 특정 값만 허용하도록 제한
  parent?: Parent
}

interface UpdateIssue {
  issue_id: number
  issue_key: string
  issuetype: string
  start_at: string | null
  end_at: string | null
}

interface FunctionDetail {
  title: string
  description: string
}

interface ProjectData {
  jiraId?: string
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  techStack?: string
  feSkill?: string
  beSkill?: string
  infraSkill?: string
  projectImagePath?: string | File
  deleteImage?: boolean
}

const getMonthlyEpics = async (projectKey: string): Promise<Epic[]> => {
  const res = await privateAPI.get(`/issues/monthly?project=${projectKey}`)
  const issues = res.data.result

  return issues.map((epic: Epic) => ({
    id: epic.id,
    key: epic.key,
    summary: epic.summary,
    description: epic.description,
    priority: epic.priority,
    startAt: epic.startAt ? new Date(epic.startAt) : null,
    endAt: epic.endAt ? new Date(epic.endAt) : null,
  }))
}

const updateIssue = async (
  issue_id: number,
  issue_key: string,
  issuetype: string,
  start_at: string | null,
  end_at: string | null,
): Promise<void> => {
  const adjustedStartAt = start_at
    ? new Date(
        new Date(start_at).setDate(new Date(start_at).getDate() + 1),
      ).toISOString()
    : null
  const adjustedEndAt = end_at
    ? new Date(
        new Date(end_at).setDate(new Date(end_at).getDate() + 1),
      ).toISOString()
    : null

  const requestData: UpdateIssue = {
    issue_id,
    issue_key,
    issuetype,
    start_at: adjustedStartAt,
    end_at: adjustedEndAt,
  }
  try {
    const res = await privateAPI.post('/issues/update/schedule', requestData)
    console.log('수정 요청: ', requestData)
    return res.data
  } catch (error) {
    console.error('Error updating issue:', error)
    throw error
  }
}

const getWeeklyStories = async (projectKey: string): Promise<Story[]> => {
  const res = await privateAPI.get(`/issues/weekly?project=${projectKey}`)
  const issues: Issue[] = res.data.result // Issue 타입 명시
  issues.map((issue: Issue) => console.log(issue.parent?.summary))
  return issues.map((issue: Issue) => ({
    id: issue.id,
    key: issue.key,
    title: issue.summary,
    status: convertStatus(issue.status),
    parent: issue.parent
      ? {
          id: issue.parent.id, // 'id' 추가
          summary: issue.parent.summary,
        }
      : undefined,
    tasks: issue.subtasks.map((subtask) => ({
      title: subtask.summary,
      start: subtask.startAt ? new Date(subtask.startAt) : new Date(),
      end: subtask.endAt ? new Date(subtask.endAt) : new Date(),
    })),
  }))
}

// 상태 값을 "To Do" | "In Progress" | "Done"으로 변환하는 헬퍼 함수
const convertStatus = (status: string): 'To Do' | 'In Progress' | 'Done' => {
  if (status === '해야 할 일') return 'To Do'
  if (status === '진행 중') return 'In Progress'
  if (status === '완료') return 'Done'
  return 'To Do' // 기본값
}

const getProjectInfo = async (jiraProjectKey: string) => {
  const res = await privateAPI.get(`/project/${jiraProjectKey}`)
  return res.data.result
}

const createProject = async (projectData: ProjectData) => {
  console.log(projectData)
  const formData = new FormData()

  // 필드가 존재할 경우에만 formData에 추가
  if (projectData.jiraId) formData.append('jiraId', projectData.jiraId)
  if (projectData.name) formData.append('name', projectData.name)
  if (projectData.description)
    formData.append('description', projectData.description)
  if (projectData.startDate) formData.append('startDate', projectData.startDate)
  if (projectData.endDate) formData.append('endDate', projectData.endDate)
  if (projectData.techStack) formData.append('techStack', projectData.techStack)
  if (projectData.feSkill) formData.append('feSkill', projectData.feSkill)
  if (projectData.beSkill) formData.append('beSkill', projectData.beSkill)
  if (projectData.infraSkill)
    formData.append('infraSkill', projectData.infraSkill)
  if (projectData.projectImagePath)
    formData.append('projectImagePath', projectData.projectImagePath)
  if (projectData.deleteImage !== undefined)
    formData.append('deleteImage', projectData.deleteImage.toString())

  formData.forEach((value, key) => {
    console.log(`${key}: ${value}`)
  })

  // Axios를 통해 POST 요청 전송
  const res = await privateAPI.put('/project', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return res.data
}

// 프로젝트의 기능 목록을 업데이트하는 함수
const updateProjectFunctions = async (
  jiraProjectKey: string,
  functions: FunctionDetail[],
) => {
  try {
    const res = await privateAPI.put(
      `/project/${jiraProjectKey}/functions`,
      functions,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return res.data
  } catch (error) {
    console.error('Failed to update project functions:', error)
    throw error
  }
}

// 프로젝트의 기능 목록을 가져오는 함수
const getProjectFunctions = async (
  jiraProjectKey: string,
): Promise<FunctionDetail[]> => {
  try {
    const res = await privateAPI.get(`/project/${jiraProjectKey}/functions`)
    return res.data.result // result에서 title과 description 정보가 포함된 배열 반환
  } catch (error) {
    console.error('Failed to fetch project functions:', error)
    throw error
  }
}

// src/api/project.ts

const updateIssueStatus = async (
  issueKey: string,
  status: 'To Do' | 'In Progress' | 'Done',
): Promise<string> => {
  try {
    const requestData = {
      issue_key: issueKey,
      status,
    }

    const res = await privateAPI.put('/issues/status', requestData)
    return res.data.result
  } catch (error) {
    console.error('Failed to update issue status:', error)
    throw new Error('이슈 상태 업데이트에 실패했습니다.')
  }
}

const updateIssueDetails = async (issueData: {
  issue_id: number | null
  issue_key: string | null
  summary: string
  description: string
  priority: string
  story_points: number
  // parent_issue_id: number;
}): Promise<string> => {
  try {
    console.log('Request Data:', issueData) // 요청 전 데이터 확인

    const res = await privateAPI.put('/issues/update', issueData) // API 호출
    console.log('Response Data:', res.data) // 응답 데이터 확인

    return res.data.result // 성공 메시지 반환
  } catch (error) {
    console.error('이슈 수정 실패:', error)
    throw new Error('이슈 수정 요청 중 오류가 발생했습니다.')
  }
}

const getIssueDetails = async (
  issueKey: string,
): Promise<{
  summary: string
  status: string
  description: string
  priority: string
  issue_id: number
  issue_key: string
  story_points: number
}> => {
  try {
    const res = await privateAPI.get(`/issues/${issueKey}`)
    const { result } = res.data
    console.log('이슈 상세 정보:', result)

    return {
      summary: result.summary,
      status: result.status,
      description: result.description,
      priority: result.priority,
      issue_id: result.id,
      issue_key: result.key,
      story_points: result.story_points,
    }
  } catch (error) {
    console.error('이슈 상세 정보 요청 실패:', error)
    throw new Error('이슈 상세 정보 요청 중 오류가 발생했습니다.')
  }
}

export {
  getIssueDetails,
  updateIssueDetails,
  updateIssueStatus,
  getProjectList,
  getWeeklyStories,
  getProjectInfo,
  createProject,
  updateProjectFunctions,
  getProjectFunctions,
  getMonthlyEpics,
  updateIssue,
}

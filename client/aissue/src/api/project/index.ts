// src/api/project.ts
import { privateAPI } from '@/api/axios';

const getProjectList = async () => {
  const res = await privateAPI.get('/member/projects');
  return res.data.result.projectIds;
};

interface Task {
  title: string;
  start: Date;
  end: Date;
}

interface Story {
  id: string;
  title: string;
  tasks: Task[];
  status: 'To Do' | 'In Progress' | 'Done'; // 특정 값만 허용하도록 제한
}

interface Epic {
  id: number;
  key: string;
  summary: string;
  description: string;
  priority: string;
  startAt: string;
  endAt: string;
}

// 추가된 인터페이스 정의
interface Subtask {
  summary: string;
  startAt: string | null;
  endAt: string | null;
}

interface Issue {
  key: string;
  summary: string;
  subtasks: Subtask[];
  status: 'To Do' | 'In Progress' | 'Done'; // 특정 값만 허용하도록 제한
}

interface UpdateIssue {
  "issue_id": number;
  "issue_key": string;
  "issuetype": string;
  "start_at": string | null;
  "end_at": string | null;
}

interface FunctionDetail {
  title: string;
  description: string;
}

interface ProjectData {
  jiraId?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  techStack?: string;
  feSkill?: string;
  beSkill?: string;
  infraSkill?: string;
  projectImagePath?: string | File;
  deleteImage?: boolean;
}

const getMonthlyEpics = async (projectKey: string): Promise<Epic[]> => {
  const res = await privateAPI.get(`/issues/monthly?project=${projectKey}`);
  const issues = res.data.result;

  return issues.map((epic: Epic) => ({
    id: epic.id,
    key: epic.key,
    summary: epic.summary,
    description: epic.description,
    priority: epic.priority,
    startAt: epic.startAt ? new Date(epic.startAt) : new Date(),
    endAt: epic.endAt ? new Date(epic.endAt) : new Date(),
  }));
};

const updateIssue = async (
  issue_id: number,
  issue_key: string,
  issuetype: string,
  start_at: string | null,
  end_at: string | null
): Promise<any> => {
  const requestData: UpdateIssue = {
    issue_id,
    issue_key,
    issuetype,
    start_at,
    end_at,
  };
  try {
    const res = await privateAPI.post('/issues/update/schedule', requestData);
    console.log('수정 요청');
    return res.data;
  } catch (error) {
    console.error('Error updating issue:', error);
    throw error;
  }
};

const getWeeklyStories = async (projectKey: string): Promise<Story[]> => {
  const res = await privateAPI.get(`/issues/weekly?project=${projectKey}`);
  const issues: Issue[] = res.data.result;

  return issues.map((issue) => ({
    id: issue.key,
    title: issue.summary,
    // 상태를 문자열에 맞게 변환
    status: convertStatus(issue.status),
    tasks: issue.subtasks.map((subtask) => ({
      title: subtask.summary,
      start: subtask.startAt ? new Date(subtask.startAt) : new Date(),
      end: subtask.endAt ? new Date(subtask.endAt) : new Date(),
    })),
  }));
};

// 상태 값을 "To Do" | "In Progress" | "Done"으로 변환하는 헬퍼 함수
const convertStatus = (status: string): 'To Do' | 'In Progress' | 'Done' => {
  if (status === '해야 할 일') return 'To Do';
  if (status === '진행 중') return 'In Progress';
  if (status === '완료') return 'Done';
  return 'To Do'; // 기본값
};

const getProjectInfo = async (jiraProjectKey: string) => {
  const res = await privateAPI.get(`/project/${jiraProjectKey}`);
  return res.data.result;
};

const createProject = async (projectData: ProjectData) => {
  console.log(projectData)
  const formData = new FormData();

  // 필드가 존재할 경우에만 formData에 추가
  if (projectData.jiraId) formData.append('jiraId', projectData.jiraId);
  if (projectData.name) formData.append('name', projectData.name);
  if (projectData.description) formData.append('description', projectData.description);
  if (projectData.startDate) formData.append('startDate', projectData.startDate);
  if (projectData.endDate) formData.append('endDate', projectData.endDate);
  if (projectData.techStack) formData.append('techStack', projectData.techStack);
  if (projectData.feSkill) formData.append('feSkill', projectData.feSkill);
  if (projectData.beSkill) formData.append('beSkill', projectData.beSkill);
  if (projectData.infraSkill) formData.append('infraSkill', projectData.infraSkill);
  if (projectData.projectImagePath) formData.append('projectImagePath', projectData.projectImagePath);
  if (projectData.deleteImage !== undefined) formData.append('deleteImage', projectData.deleteImage.toString());

  formData.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  // Axios를 통해 POST 요청 전송
  const res = await privateAPI.put('/project', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

// 프로젝트의 기능 목록을 업데이트하는 함수
const updateProjectFunctions = async (
  jiraProjectKey: string,
  functions: FunctionDetail[]
) => {
  try {
    const res = await privateAPI.put(`/project/${jiraProjectKey}/functions`, functions, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Failed to update project functions:', error);
    throw error;
  }
};

// 프로젝트의 기능 목록을 가져오는 함수
const getProjectFunctions = async (jiraProjectKey: string): Promise<FunctionDetail[]> => {
  try {
    const res = await privateAPI.get(`/project/${jiraProjectKey}/functions`);
    return res.data.result; // result에서 title과 description 정보가 포함된 배열 반환
  } catch (error) {
    console.error('Failed to fetch project functions:', error);
    throw error;
  }
};

export { getProjectList, getWeeklyStories, getProjectInfo, createProject, updateProjectFunctions, getProjectFunctions, getMonthlyEpics, updateIssue };

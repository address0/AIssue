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

interface ProjectData {
  jiraId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  techStack: string;
  feSkill: string;
  beSkill: string;
  infraSkill: string;
  projectImagePath: string | File;
  deleteImage: boolean;
}

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
  
  // 폼 데이터에 필드 추가
  formData.append('jiraId', projectData.jiraId);
  formData.append('name', projectData.name);
  formData.append('description', projectData.description);
  formData.append('startDate', projectData.startDate);
  formData.append('endDate', projectData.endDate);
  formData.append('techStack', projectData.techStack);
  formData.append('feSkill', projectData.feSkill);
  formData.append('beSkill', projectData.beSkill);
  formData.append('infraSkill', projectData.infraSkill);
  formData.append('projectImagePath', projectData.projectImagePath);
  formData.append('deleteImage', projectData.deleteImage.toString());

  // Axios를 통해 POST 요청 전송
  const res = await privateAPI.put('/project', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data;
};

export { getProjectList, getWeeklyStories, getProjectInfo, createProject };

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
}

const getWeeklyStories = async (projectKey: string): Promise<Story[]> => {
  const res = await privateAPI.get(`/issues/weekly?project=${projectKey}`);
  const issues: Issue[] = res.data.result;

  return issues.map((issue) => ({
    id: issue.key,
    title: issue.summary,
    tasks: issue.subtasks.map((subtask) => ({
      title: subtask.summary,
      start: subtask.startAt ? new Date(subtask.startAt) : new Date(),
      end: subtask.endAt ? new Date(subtask.endAt) : new Date(),
    })),
  }));
};

const getProjectInfo = async (jiraProjectKey: string) => {
  const res = await privateAPI.get(`/project/${jiraProjectKey}`);
  return res.data.result;
};

export { getProjectList, getWeeklyStories, getProjectInfo };

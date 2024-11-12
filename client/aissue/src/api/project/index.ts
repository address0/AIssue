import { privateAPI } from '@/api/axios'

const getProjectList = async () => {
  const res = await privateAPI.get('/member/projects')
  return res.data.result.projectIds
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

const getWeeklyStories = async (projectKey: string): Promise<Story[]> => {
  const res = await privateAPI.get(`/issues/weekly?project=${projectKey}`);
  const issues = res.data.result;

  return issues.map((issue: any) => ({
    id: issue.key,
    title: issue.summary,
    tasks: issue.subtasks.map((subtask: any) => ({
      title: subtask.summary,
      start: subtask.startAt ? new Date(subtask.startAt) : new Date(),
      end: subtask.endAt ? new Date(subtask.endAt) : new Date(),
    })),
  }));
};

export { getProjectList, getWeeklyStories };

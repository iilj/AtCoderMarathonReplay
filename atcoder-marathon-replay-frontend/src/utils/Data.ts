import Contest from '../interfaces/Contest';
import Task from '../interfaces/Task';
import Submission from '../interfaces/Submission';

const CONTEST_SUBMISSION_MAP: Map<string, Submission[]> = new Map<
  string,
  Submission[]
>();
export const fetchContestSubmissions = async (
  contest?: string
): Promise<Submission[]> =>
  contest !== undefined && contest.length > 0
    ? !CONTEST_SUBMISSION_MAP.has(contest)
      ? fetch(`${process.env.PUBLIC_URL}/submissions/${contest}.json`)
          .catch((e) => {
            throw Error(e);
          })
          .then(async (r) => {
            const submissions = (await r.json()) as Submission[];
            CONTEST_SUBMISSION_MAP.set(contest, submissions);
            return submissions;
          })
      : Promise.resolve(CONTEST_SUBMISSION_MAP.get(contest) as Submission[])
    : Promise.resolve([]);

const CONTEST_TASK_MAP: Map<string, Task[]> = new Map<string, Task[]>();
export const fetchContestTasks = async (contest?: string): Promise<Task[]> =>
  contest !== undefined && contest.length > 0
    ? !CONTEST_TASK_MAP.has(contest)
      ? fetch(`${process.env.PUBLIC_URL}/tasks/${contest}.json`)
          .catch((e) => {
            throw Error(e);
          })
          .then(async (r) => {
            const tasks = (await r.json()) as Task[];
            CONTEST_TASK_MAP.set(contest, tasks);
            return tasks;
          })
      : Promise.resolve(CONTEST_TASK_MAP.get(contest) as Task[])
    : Promise.resolve([]);

let CONTESTS: Contest[] | undefined = undefined;
export const fetchContests = async (): Promise<Contest[]> =>
  CONTESTS === undefined
    ? fetch(`${process.env.PUBLIC_URL}/contests/contests.json`)
        .catch((e) => {
          throw Error(e);
        })
        .then(async (r) => {
          CONTESTS = (await r.json()) as Contest[];
          return CONTESTS;
        })
    : Promise.resolve(CONTESTS);

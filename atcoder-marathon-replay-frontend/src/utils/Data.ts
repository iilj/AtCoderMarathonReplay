import Contest from '../interfaces/Contest';
import Submission from '../interfaces/Submission';

export const fetchContestSubmissions = async (
  contest?: string
): Promise<Submission[]> =>
  contest !== undefined && contest.length > 0
    ? fetch(`${process.env.PUBLIC_URL}/submissions/${contest}.json`).then(
        (r) => r.json() as Promise<Submission[]>
      )
    : Promise.resolve([]);

export const fetchContests = async (): Promise<Contest[]> =>
  fetch(`${process.env.PUBLIC_URL}/contests/contests.json`).then(
    (r) => r.json() as Promise<Contest[]>
  );

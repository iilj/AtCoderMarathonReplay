import Contest from '../interfaces/Contest';
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

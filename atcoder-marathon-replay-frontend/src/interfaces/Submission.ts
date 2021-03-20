export default interface Submission {
  readonly submission_id: number;
  readonly task: string;
  readonly time_unix: number;
  readonly user_name: string;
  score: number;
  readonly status: string;
}

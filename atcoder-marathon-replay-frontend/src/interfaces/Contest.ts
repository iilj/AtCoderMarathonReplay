export default interface Contest {
  readonly contest_slug: string;
  readonly contest_name: string;
  readonly start_time_unix: number;
  readonly end_time_unix: number;
}

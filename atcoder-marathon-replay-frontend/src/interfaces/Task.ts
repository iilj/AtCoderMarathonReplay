export default interface Task {
  contest_slug: string;
  task_slug: string;
  label: string;
  name: string;
  time_limit_sec: number;
  memory_limit_mb: number;
}

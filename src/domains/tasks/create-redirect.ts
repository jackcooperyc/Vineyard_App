export function redirectAfterTaskCreate(result: {
  taskId?: string;
  began?: boolean;
  tracksGps?: boolean;
}): string {
  if (!result.taskId) return "/tasks";
  if (result.began && result.tracksGps) return "/field";
  if (result.began) return `/tasks/${result.taskId}`;
  return `/tasks/${result.taskId}`;
}

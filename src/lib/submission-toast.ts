import { toast } from "sonner";

const TOAST_DURATION = 4500;

function showSuccessToast(title: string, description?: string) {
  toast.success(title, {
    description,
    duration: TOAST_DURATION,
  });
}

export function showTaskLoggedToast(
  detail?: string,
  options?: { began?: boolean },
) {
  showSuccessToast(
    options?.began ? "Task logged — starting GPS" : "Task logged successfully",
    detail,
  );
}

export function showIrrigationLoggedToast(detail?: string) {
  showSuccessToast("Irrigation logged successfully", detail);
}

export function showIrrigationRecordSavedToast(
  detail?: string,
  options?: { isEdit?: boolean },
) {
  showSuccessToast(
    options?.isEdit
      ? "Irrigation record updated successfully"
      : "Irrigation logged successfully",
    detail,
  );
}

export function showIrrigationScheduleSavedToast(
  detail?: string,
  options?: { isEdit?: boolean },
) {
  showSuccessToast(
    options?.isEdit
      ? "Schedule updated successfully"
      : "Schedule created successfully",
    detail,
  );
}

export function showBlockSavedToast(detail?: string) {
  showSuccessToast("Block updated successfully", detail);
}

export function showNoteCreatedToast(detail?: string) {
  showSuccessToast("Field note logged successfully", detail);
}

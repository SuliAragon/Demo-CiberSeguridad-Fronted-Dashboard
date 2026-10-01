import { analysts, type AlertUpdate } from "./types";
export function parseAlertUpdate(value: unknown): AlertUpdate | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).length !== 2 ||
    typeof record.status !== "string" ||
    !["open", "investigating", "resolved"].includes(record.status) ||
    !analysts.some((a) => a === record.owner)
  )
    return null;
  return { status: record.status as AlertUpdate["status"], owner: record.owner as string };
}

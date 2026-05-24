export const AttendanceStatus = {
  ON_TIME: 'ON_TIME',
  LATE: 'LATE',
  EARLY_LEAVE: 'EARLY_LEAVE',
  ABSENT: 'ABSENT',
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
export const ATTENDANCE_STATUS_VALUES = Object.values(AttendanceStatus);

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
}

export function formatTimeRange(startDate: Date, endDate: Date): string {
  return `${formatTime(startDate)} - ${formatTime(endDate)} WIB`;
}

export function getTimeUntil(targetDate: Date): string {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Sudah berlangsung';
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} hari lagi`;
  if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60;
    return `${diffHours} jam ${remainingMinutes} mnt`;
  }
  return `${diffMinutes} menit lagi`;
}

export function isScheduleNow(startTime: Date, endTime: Date): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
}

export function isScheduleUpcoming(startTime: Date): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 6; // Upcoming dalam 6 jam ke depan
}

export function formatDeadline(deadline: Date): string {
  const now = new Date();
  const target = new Date(deadline);
  const diffMs = target.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  
  if (diffHours <= 0) {
    return 'Sudah lewat deadline';
  } else if (diffHours <= 24) {
    return `Hari Ini, ${formatTime(target)} WIB`;
  } else if (diffDays <= 7) {
    return new Date(target).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  } else {
    return new Date(target).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  }
}

export function getPriorityLabel(deadline: Date | null): { label: string; tone: 'urgent' | 'medium' | 'normal' } {
  if (!deadline) return { label: 'Normal', tone: 'normal' };
  
  const now = new Date();
  const target = new Date(deadline);
  const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours <= 24) return { label: 'Urgent', tone: 'urgent' };
  if (diffHours <= 72) return { label: 'Medium', tone: 'medium' };
  return { label: 'Normal', tone: 'normal' };
}

export function extractInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCurrentSemester(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 0-indexed
  const year = now.getFullYear();
  
  // Semester Ganjil: Agustus - Januari
  // Semester Genap: Februari - Juli
  if (month >= 8 || month <= 1) {
    const academicYear = month >= 8 ? year : year - 1;
    return `Semester Ganjil ${academicYear}/${academicYear + 1}`;
  } else {
    return `Semester Genap ${year - 1}/${year}`;
  }
}

export function getSKSStatus(currentSKS: number): { max: number; status: string } {
  const max = 24;
  if (currentSKS >= 21) return { max, status: 'Optimal' };
  if (currentSKS >= 18) return { max, status: 'Baik' };
  if (currentSKS >= 15) return { max, status: 'Cukup' };
  return { max, status: 'Kurang' };
}

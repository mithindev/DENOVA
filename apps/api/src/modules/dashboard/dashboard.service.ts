import prisma from '../../services/db.service';

interface CachedData {
  patients: number;
  todayAppointments: number;
  timestamp: number;
}

const statsCache = new Map<string, CachedData>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export class DashboardService {
  static async getStats(clinicId: string) {
    const cached = statsCache.get(clinicId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return {
        patients: cached.patients,
        todayAppointments: cached.todayAppointments,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [patientCount, todayApptCount] = await Promise.all([
      prisma.patient.count({ where: { clinicId } }),
      prisma.appointment.count({
        where: {
          patient: {
            clinicId,
          },
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    const stats = {
      patients: patientCount,
      todayAppointments: todayApptCount,
    };

    statsCache.set(clinicId, { ...stats, timestamp: now });

    return stats;
  }
}

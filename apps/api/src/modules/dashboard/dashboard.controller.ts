import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    const clinicId = (req as any).user.clinicId;
    const stats = await DashboardService.getStats(clinicId);
    res.json(stats);
  }
}

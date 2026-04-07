import { Router } from 'express';
import { listStaff, getStaffMember, createStaff, updateStaff, deleteStaff } from './staff.controller';
import { createStaffSchema, updateStaffSchema } from './staff.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/', listStaff);
router.get('/:id', getStaffMember);
router.post('/', validate(createStaffSchema), createStaff);
router.patch('/:id', validate(updateStaffSchema), updateStaff);
router.delete('/:id', deleteStaff);

export default router;

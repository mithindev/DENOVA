import { Router } from 'express';
import { listBills, getBill, createBill, updateBill } from './billing.controller';
import { createBillingSchema, updateBillingSchema } from './billing.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', listBills);
router.get('/:id', getBill);
router.post('/', validate(createBillingSchema), createBill);
router.patch('/:id', validate(updateBillingSchema), updateBill);

export default router;

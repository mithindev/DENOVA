import { Router } from 'express';
import { login, register, me } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/me', authenticate, me);

export default router;

import express from 'express';
import { login} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);

export default router;  
//compere this snippet from frontend/src/index.js:
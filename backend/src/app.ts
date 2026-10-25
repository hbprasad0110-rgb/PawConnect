import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { appConfig } from './config/constants.ts';
import { env } from './config/env.ts';
import authRoutes from './routes/authRoutes.ts';
import animalRoutes, { adminAnimalRouter, adminMedicalRouter } from './routes/animalRoutes.ts';
import applicationRoutes, { adminApplicationRouter } from './routes/applicationRoutes.ts';
import appointmentRoutes, { adminAppointmentRouter } from './routes/appointmentRoutes.ts';
import adoptionRoutes from './routes/adoptionRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';
import { errorHandler, notFoundHandler } from './core/errors.ts';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: appConfig.jsonBodyLimit }));
app.use(cookieParser());

const api = appConfig.apiPrefix;
app.get(`${api}/health`, (_req, res) => res.json({ data: { status: 'ok', service: appConfig.serviceName } }));
app.use(`${api}/auth`, authRoutes);
app.use(`${api}/animals`, animalRoutes);
app.use(`${api}/applications`, applicationRoutes);
app.use(`${api}/appointments`, appointmentRoutes);
app.use(`${api}/adoptions`, adoptionRoutes);
app.use(`${api}/admin/animals`, adminAnimalRouter);
app.use(`${api}/admin/medical-records`, adminMedicalRouter);
app.use(`${api}/admin/applications`, adminApplicationRouter);
app.use(`${api}/admin/appointments`, adminAppointmentRouter);
app.use(`${api}/admin`, adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

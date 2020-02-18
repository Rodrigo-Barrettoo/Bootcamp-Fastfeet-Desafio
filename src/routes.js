import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryStartController from './app/controllers/DeliveryStartController';
import DeliverymanDeliveryController from './app/controllers/DeliverymanDeliveryController';
import DeliveryFinishController from './app/controllers/DeliveryFinishController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

import authMiddleware from './app/middleware/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/list_deliveries/:id', DeliverymanDeliveryController.index);
routes.get('/deliveryman/:id/deliveries', DeliverymanDeliveryController.show);
routes.put(
  '/delivery/:idDelivery/:idDeliveryman/finish',
  upload.single('file'),
  DeliveryFinishController.update
);

routes.post('/delivery/:id/problems', DeliveryProblemsController.store);
routes.get('/delivery/:id/problems', DeliveryProblemsController.index);
routes.delete('/problems/:id/delivery', DeliveryProblemsController.delete);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/deliverymans', DeliverymanController.index);
routes.get('/deliverymans/:id', DeliverymanController.show);
routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.delete('/deliverymans/:id', DeliverymanController.delete);

routes.get('/delivery', DeliveryController.index);
routes.post('/delivery', DeliveryController.store);
routes.put('/delivery/:id', DeliveryController.update);
routes.delete('/delivery/:id', DeliveryController.delete);

routes.put('/delivery/:id/start', DeliveryStartController.update);

export default routes;

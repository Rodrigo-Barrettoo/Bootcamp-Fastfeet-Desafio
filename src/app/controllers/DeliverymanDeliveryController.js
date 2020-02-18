import * as Yup from 'yup';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class DeliverymanDeliveryController {
  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
      attributes: [
        ['id', 'id_delivery'],
        'recipient_id',
        'product',
        'start_date',
        'end_date',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          where: { id: req.params.id },
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      where: { end_date: { [Op.ne]: null } },
      attributes: ['product', 'start_date', 'end_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          where: { id: req.params.id },
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(deliveries);
  }
}

export default new DeliverymanDeliveryController();

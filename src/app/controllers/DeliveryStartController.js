import * as Yup from 'yup';
import { Op } from 'sequelize';
import { format, startOfHour, parseISO, isBefore } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class DeliveryStartController {
  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!delivery) {
      return res.status(400).json('Delivery does not exist');
    }

    if (delivery.canceled_at) {
      return res.status(400).json('Delivery was canceled');
    }

    if (delivery.start_date) {
      return res.status(400).json('Delivery already started');
    }

    if (delivery.end_date) {
      return res.status(400).json('Delivery already completed');
    }

    const { start_date } = req.body;

    const hourStart = startOfHour(parseISO(start_date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const currentTime = hourStart.getHours();

    if (!(currentTime >= 8 && currentTime <= 18)) {
      return res
        .status(400)
        .json('Withdrawal time is only allowed between 8 am and 6 pm');
    }

    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    const deliveryman = await Deliveryman.findByPk(delivery.deliveryman.id);
    if (!deliveryman) {
      return res.status(400).json('Deliveryman does not exist');
    }

    const deliveryLimit = await Delivery.count({
      where: {
        deliveryman_id: delivery.deliveryman.id,
        end_date: { [Op.ne]: null },
      },
    });

    if (deliveryLimit >= 5) {
      return res.status(400).json('The limit is 5 deliveries per day');
    }

    const {
      id,
      recipient_id,
      deliveryman_id,
      product,
      canceled_at,
      end_date,
    } = await delivery.update({ start_date });

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
      canceled_at,
      end_date,
      start_date: formattedDate,
    });
  }
}

export default new DeliveryStartController();

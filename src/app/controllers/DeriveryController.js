import * as Yup from 'yup';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import Mail from '../../lib/Mail';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findOne({
      where: { id: req.body.recipient_id },
    });

    if (!recipient) {
      return res.status(400).json('Recipient not found');
    }

    const deliveryman = await Deliveryman.findOne({
      where: { id: req.body.deliveryman_id },
    });

    if (!deliveryman) {
      return res.status(400).json('Deliveryman not found');
    }

    const delivery = await Delivery.create(req.body);

    const include_derivery = await Delivery.findOne({
      where: { id: delivery.id },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          where: { id: req.body.recipient_id },
          attributes: [
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zipcode',
          ],
        },
      ],
    });

    await Mail.sendMail({
      to: `${include_derivery.deliveryman.name} <${include_derivery.deliveryman.email}>`,
      subject: 'Nova Encomenda',
      template: 'newDerivery',
      context: {
        deliveryman: include_derivery.deliveryman.name,
        product: include_derivery.product,
        date: format(
          include_derivery.createdAt,
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          { locale: pt }
        ),
        street: include_derivery.recipient.street,
        number: include_derivery.recipient.number,
        city: include_derivery.recipient.city,
        state: include_derivery.recipient.state,
        cep: include_derivery.recipient.zipcode,
        complement: include_derivery.recipient.complement,
      },
    });

    return res.json(delivery);
  }
}

export default new DeliveryController();

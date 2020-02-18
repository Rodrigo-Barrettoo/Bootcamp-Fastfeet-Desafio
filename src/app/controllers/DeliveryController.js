import * as Yup from 'yup';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import Mail from '../../lib/Mail';

class DeliveryController {
  async index(req, res) {
    const deliveries = await Delivery.findAll();

    return res.json(deliveries);
  }

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

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json('Validations fails');
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json('Delivery not found');
    }

    if (req.body.recipient_id) {
      const recipientId = await Recipient.findOne({
        where: { id: req.body.recipient_id },
      });

      if (!recipientId) {
        return res.status(400).json('Recipient not found');
      }
    }

    if (req.body.deliveryman_id) {
      const deliveryman = await Deliveryman.findOne({
        where: { id: req.body.deliveryman_id },
      });

      if (!deliveryman) {
        return res.status(400).json('Deliveryman not found');
      }
    }

    const { start_date } = req.body;

    const {
      product,
      recipient_id,
      deliveryman_id,
      end_date,
    } = await delivery.update(req.body);

    return res.json({
      product,
      recipient_id,
      deliveryman_id,
      start_date,
      end_date,
    });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json('Delivery does not exists');
    }

    delivery.destroy({ where: delivery });

    return res.json();
  }
}

export default new DeliveryController();

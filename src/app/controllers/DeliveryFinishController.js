import Delivery from '../models/Delivery';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';

class DeliveryFinishController {
  async update(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.idDeliveryman);

    if (!deliveryman) {
      return res.status(400).json('Deliveryman does not exist');
    }

    const delivery = await Delivery.findByPk(req.params.idDelivery);

    if (!delivery) {
      return res.status(400).json('Delivery does not exist');
    }

    if (delivery.canceled_at) {
      return res.status(400).json('Delivery has been canceled');
    }

    if (!delivery.start_date) {
      return res.status(400).json('Delivery not started');
    }

    const isBelongingOrder = await Delivery.findByPk(req.params.idDelivery, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          where: { id: req.params.idDeliveryman },
        },
      ],
    });

    if (!isBelongingOrder) {
      return res
        .status(400)
        .json('The order does not belong to the requested delivery');
    }

    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    const {
      id,
      recipient_id,
      deliveryman_id,
      product,
      start_date,
      end_date,
    } = await delivery.update({ end_date: new Date(), signature_id: file.id });

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
      start_date,
      end_date,
    });
  }
}

export default new DeliveryFinishController();

import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipient.findAll();

    return res.json(recipients);
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

    const recipientId = req.params.id;

    const recipient = await Recipient.findByPk(recipientId);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exist' });
    }

    return res.json(recipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number()
        .positive()
        .required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
      complement: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipientExists = await Recipient.findOne({
      where: { name: req.body.name },
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient already exists' });
    }

    const {
      id,
      name,
      street,
      number,
      state,
      city,
      zipcode,
      complement,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      state,
      city,
      zipcode,
      complement,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number().positive(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.string(),
      complement: Yup.string().length(9),
    });

    if (!(await schema.isValid(req.params, req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipientId = req.params.id;

    const recipient = await Recipient.findByPk(recipientId);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exist' });
    }

    const {
      id,
      name,
      street,
      number,
      state,
      city,
      zipcode,
      complement,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      state,
      city,
      zipcode,
      complement,
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

    const recipientId = req.params.id;

    const recipient = await Recipient.findByPk(recipientId);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exist' });
    }

    recipient.destroy({ where: recipient });

    return res.status(200).json({ message: 'Recipient has been deleted' });
  }
}

export default new RecipientController();

import User from '../mongodb/models/user.js';

import { authenticateUser } from '../auth/auth.js';

const getAllUsers = async (req, res) => {
  try {
    // Authenticate token
    const userEmail = await authenticateUser(req).catch((err) =>
      res.status(404).json({ message: 'Invalid token', error: err })
    );

    // Check if this user exists
    const userExists = await User.findOne({ email: userEmail });

    if (!userExists) return res.status(404).json({ message: 'Invalid token' });

    const users = await User.find({});

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    // Authenticate token
    const userEmail = await authenticateUser(req).catch((err) =>
      res.status(404).json({ message: 'Invalid token', error: err })
    );

    if (!userEmail) {
      return res.status(404).json({ message: 'Invalid token' });
    }

    const { name, email, avatar } = req.body;

    // Skip if user already exists in database
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(200).json(userExists);

    const newUser = await User.create({
      name,
      email,
      avatar,
    });

    return res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserInfoByID = async (req, res) => {
  try {
    // Authenticate token
    const userEmail = await authenticateUser(req).catch((err) =>
      res.status(404).json({ message: 'Invalid token', error: err })
    );

    // Check if this user exists
    const userExists = await User.findOne({ email: userEmail });

    if (!userExists) return res.status(404).json({ message: 'Invalid token' });

    const { id } = req.params;

    const user = await User.findOne({ _id: id }).populate('allProperties');

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAllUsers, createUser, getUserInfoByID };

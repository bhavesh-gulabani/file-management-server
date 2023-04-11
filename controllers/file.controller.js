import multer from 'multer';
import File from '../mongodb/models/file.js';
import User from '../mongodb/models/user.js';

import path from 'path';
import mongoose from 'mongoose';

import { authenticateUser } from '../auth/auth.js';

let __dirname = path.dirname(new URL(import.meta.url).pathname);

// Multer storage configuration
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.userId} - ${file.originalname}`);
  },
});

const upload = multer({
  storage: multerStorage,
}).single('file');

const uploadFile = async (req, res) => {
  try {
    // Authenticate token
    const userEmail = await authenticateUser(req).catch((err) =>
      res.status(404).json({ message: 'Invalid token', error: err })
    );

    // Check if this user exists
    const userExists = await User.findOne({ email: userEmail });

    if (!userExists) return res.status(404).json({ message: 'Invalid token' });

    // Upload file and store file details in database
    upload(req, res, async (err) => {
      if (err) {
        res.status(400).json({ message: 'Error uploading file.' });
      } else {
        const { userId } = req.params;
        const { filename: name, path, mimetype: mimeType } = req.file;

        // Check if file with same name already exists
        const file = await File.findOne({ name: name });
        if (file) {
          res.status(200).json({ message: 'File uploaded successfully.' });
          return;
        }

        // Update User and File documents
        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ _id: userId }).session(session);

        if (!user) throw new Error('User not found');

        const newFile = await File.create({
          name,
          path,
          mimeType,
          creator: user._id,
        });

        user.allFiles.push(newFile._id);
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: 'File uploaded successfully.' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllFiles = async (req, res) => {
  try {
    // Authenticate token
    const userEmail = await authenticateUser(req).catch((err) =>
      res.status(404).json({ message: 'Invalid token', error: err })
    );

    // Check if this user exists
    const userExists = await User.findOne({ email: userEmail });

    if (!userExists) return res.status(404).json({ message: 'Invalid token' });

    const { userId } = req.params;

    const user = await User.findOne({ _id: userId }).populate('allFiles');

    const files = user.allFiles;

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFileDetail = async (req, res) => {
  // Authenticate token
  const userEmail = await authenticateUser(req).catch((err) =>
    res.status(404).json({ message: 'Invalid token', error: err })
  );

  // Check if this user exists
  const userExists = await User.findOne({ email: userEmail });

  if (!userExists) return res.status(404).json({ message: 'Invalid token' });

  const { id } = req.params;
  const file = await File.findOne({ _id: id }).populate('creator');

  if (file) {
    // Construct file path
    let arr = __dirname.split('/');
    arr.pop();
    arr.shift();
    let filePath = arr.join('/');
    filePath = filePath.replace(/%20/g, ' ');
    filePath = filePath + '/uploads/' + file.name;

    res.download(filePath, file.name, (err) => {
      if (err) {
        res.send({
          error: err,
          msg: 'Problem downloading the file',
        });
      }
    });
  } else {
    res.status(404).json({ message: 'File not found.' });
  }
};

export { uploadFile, getAllFiles, getFileDetail };

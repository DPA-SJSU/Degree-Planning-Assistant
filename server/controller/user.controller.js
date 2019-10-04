import express from 'express';

const userController = express.Router();

userController.get('/', (req, res) => {
  res.status(200).json({
    status: 'User Route success',
  })
});

export default userController;
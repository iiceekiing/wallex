const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to wallet routes
router.use(authenticateToken);

/**
 * @route   GET /api/wallet
 * @desc    Get user wallet information
 * @access  Private
 */
router.get('/', UserController.getWallet);

/**
 * @route   POST /api/wallet/fund
 * @desc    Add funds to wallet
 * @access  Private
 */
router.post('/fund', UserController.fundWallet);

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Withdraw funds from wallet
 * @access  Private
 */
router.post('/withdraw', UserController.withdrawWallet);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get wallet transaction history
 * @access  Private
 */
router.get('/transactions', UserController.getTransactions);

module.exports = router;

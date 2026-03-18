const User = require('../models/User');
const Wallet = require('../models/Wallet');
const database = require('../models/database');

class UserController {
  /**
   * @swagger
   * /api/user/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized - token required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          isVerified: user.is_verified,
          createdAt: user.created_at
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/wallet:
   *   get:
   *     summary: Get user wallet information
   *     tags: [Wallet]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Wallet information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Wallet'
   *       401:
   *         description: Unauthorized - token required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Wallet not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async getWallet(req, res) {
    try {
      const userId = req.user.userId;

      // Get user wallet
      const wallet = await Wallet.findByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: wallet.id,
          userId: wallet.user_id,
          balance: parseFloat(wallet.balance),
          createdAt: wallet.created_at
        }
      });

    } catch (error) {
      console.error('Get wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/wallet/fund:
   *   post:
   *     summary: Add funds to wallet
   *     tags: [Wallet]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Amount to add to wallet
   *     responses:
   *       200:
   *         description: Funds added successfully
   *       400:
   *         description: Invalid amount
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async fundWallet(req, res) {
    try {
      const userId = req.user.userId;
      const { amount } = req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      // Update wallet balance
      const updatedWallet = await Wallet.updateBalance(userId, parseFloat(amount));
      if (!updatedWallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // Record transaction (simplified for now)
      await UserController.recordTransaction(userId, 'fund', parseFloat(amount), 'Wallet funding');

      res.status(200).json({
        success: true,
        message: 'Funds added successfully',
        data: {
          id: updatedWallet.id,
          userId: updatedWallet.user_id,
          balance: parseFloat(updatedWallet.balance),
          amountAdded: parseFloat(amount)
        }
      });

    } catch (error) {
      console.error('Fund wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/wallet/withdraw:
   *   post:
   *     summary: Withdraw funds from wallet
   *     tags: [Wallet]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Amount to withdraw from wallet
   *     responses:
   *       200:
   *         description: Funds withdrawn successfully
   *       400:
   *         description: Invalid amount or insufficient funds
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async withdrawWallet(req, res) {
    try {
      const userId = req.user.userId;
      const { amount } = req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      // Get current wallet
      const wallet = await Wallet.findByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // Check sufficient funds
      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient funds'
        });
      }

      // Update wallet balance (negative amount for withdrawal)
      const updatedWallet = await Wallet.updateBalance(userId, -parseFloat(amount));
      
      // Record transaction
      await UserController.recordTransaction(userId, 'withdraw', parseFloat(amount), 'Wallet withdrawal');

      res.status(200).json({
        success: true,
        message: 'Funds withdrawn successfully',
        data: {
          id: updatedWallet.id,
          userId: updatedWallet.user_id,
          balance: parseFloat(updatedWallet.balance),
          amountWithdrawn: parseFloat(amount)
        }
      });

    } catch (error) {
      console.error('Withdraw wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/wallet/transactions:
   *   get:
   *     summary: Get wallet transaction history
   *     tags: [Wallet]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Transaction history retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async getTransactions(req, res) {
    try {
      const userId = req.user.userId;

      // Get transactions for this user
      const transactions = await UserController.getTransactionsByUserId(userId);

      res.status(200).json({
        success: true,
        data: transactions
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Helper methods
  static async recordTransaction(userId, type, amount, description) {
    const pool = database.getPool();
    
    const query = `
      INSERT INTO transactions (user_id, type, amount, description, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, user_id, type, amount, description, created_at
    `;
    
    const values = [userId, type, amount, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getTransactionsByUserId(userId) {
    const pool = database.getPool();
    
    const query = `
      SELECT id, user_id, type, amount, description, created_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount),
      createdAt: row.created_at
    }));
  }
}

module.exports = UserController;

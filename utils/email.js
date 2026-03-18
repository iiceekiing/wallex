const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  async initializeTransporter() {
    try {
      if (this.isInitialized) {
        return this.transporter;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      this.isInitialized = true;
      console.log('✅ Email service initialized');
      return this.transporter;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      throw new Error('Email service initialization failed');
    }
  }

  async sendOTP(email, otp, purpose = 'verification') {
    try {
      const transporter = await this.initializeTransporter();
      
      const subject = purpose === 'reset' 
        ? 'Wallex - Password Reset OTP'
        : 'Wallex - Email Verification OTP';

      const html = this.generateOTPTemplate(otp, purpose);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subject,
        html: html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`📧 OTP sent to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async sendWelcomeEmail(email, firstName) {
    try {
      const transporter = await this.initializeTransporter();
      
      const subject = 'Welcome to Wallex - Your Secure Escrow Platform';
      const html = this.generateWelcomeTemplate(firstName);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subject,
        html: html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  generateOTPTemplate(otp, purpose) {
    const purposeText = purpose === 'reset' ? 'Password Reset' : 'Email Verification';
    const purposeDesc = purpose === 'reset' 
      ? 'to reset your password'
      : 'to verify your email address';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wallex - ${purposeText}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .security { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">� Wallex</div>
            <div>${purposeText}</div>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested ${purposeDesc} for your Wallex account. Use the OTP code below:</p>
            
            <div class="otp">
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="security">
              <strong>🔒 Security Notice:</strong>
              <ul>
                <li>This OTP will expire in 5 minutes</li>
                <li>Never share this code with anyone</li>
                <li>Wallex will never ask for your password</li>
              </ul>
            </div>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Wallex Team</p>
              <p>📧 noreply@wallex.com | 🌐 www.wallex.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeTemplate(firstName) {
    const displayName = firstName || 'Valued Customer';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Wallex</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 32px; font-weight: bold; margin-bottom: 15px; }
          .tagline { font-size: 18px; opacity: 0.9; }
          .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
          .welcome { font-size: 24px; color: #667eea; font-weight: bold; margin-bottom: 20px; }
          .features { background: #fff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
          .feature-item { margin: 15px 0; display: flex; align-items: center; }
          .feature-icon { font-size: 20px; margin-right: 15px; color: #667eea; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .security-note { background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💳 Wallex</div>
            <div class="tagline">Secure Escrow Payments Made Simple</div>
          </div>
          <div class="content">
            <div class="welcome">Welcome to Wallex, ${displayName}! 🎉</div>
            
            <p>Thank you for joining Wallex! We're excited to have you as part of our secure escrow platform. Your account has been successfully created and is ready to use.</p>
            
            <div class="features">
              <h3 style="color: #667eea; margin-bottom: 20px;">What You Can Do With Wallex:</h3>
              <div class="feature-item">
                <span class="feature-icon">🔒</span>
                <div>
                  <strong>Secure Escrow Services</strong><br>
                  <small>Protect your transactions with our trusted escrow system</small>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💰</span>
                <div>
                  <strong>Easy Fund Management</strong><br>
                  <small>Deposit, withdraw, and manage your funds seamlessly</small>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <div>
                  <strong>Transaction History</strong><br>
                  <small>Track all your transactions with detailed records</small>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🛡️</span>
                <div>
                  <strong>Advanced Security</strong><br>
                  <small>Your funds and data are protected with enterprise-grade security</small>
                </div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173/dashboard" class="cta-button">Go to Your Dashboard</a>
            </div>
            
            <div class="security-note">
              <strong>🔐 Security Reminder:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Never share your password with anyone</li>
                <li>Always check that you're on the official Wallex website</li>
                <li>Enable two-factor authentication when available</li>
              </ul>
            </div>
            
            <p>If you have any questions or need help getting started, our support team is here to assist you at support@wallex.com.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Wallex Team</p>
              <p>📧 support@wallex.com | 🌐 www.wallex.com</p>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      const transporter = await this.initializeTransporter();
      await transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

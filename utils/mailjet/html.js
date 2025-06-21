const config = require("../../config");

const html = (otp) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Your OTP from ${config.app.name}</title>
    <style>
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        background-color: #f9fafb;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      .card {
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 32px;
        margin: 24px 0;
      }

      .logo {
        text-align: center;
        margin-bottom: 24px;
      }

      .logo a {
        color: #2563eb;
        font-size: 24px;
        font-weight: 700;
        text-decoration: none;
      }

      .otp-container {
        background: #f3f4f6;
        border-radius: 6px;
        padding: 16px;
        text-align: center;
        margin: 24px 0;
        cursor: pointer;
      }

      .otp-code {
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
        letter-spacing: 4px;
        margin: 0;
      }

      .tooltip {
        font-size: 14px;
        color: #6b7280;
        margin-top: 8px;
      }

      .footer {
        text-align: center;
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 14px;
      }

      @media (prefers-color-scheme: dark) {
        body {
          background-color: #1f2937;
        }
        .card {
          background-color: #111827;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
        }
        .logo a {
          color: #60a5fa;
        }
        .otp-container {
          background-color: #374151;
        }
        .otp-code {
          color: #f9fafb;
        }
      }

      @media only screen and (max-width: 600px) {
        .container {
          width: 100%;
          padding: 12px;
        }
        .card {
          padding: 24px;
          margin: 16px 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo">
          <a href="https://your-domain.com">${config.app.name}</a>
        </div>
        
        <h1 style="margin: 0 0 16px; font-size: 20px; color: #374151;">Password Reset Request</h1>
        
        <p>Hello,</p>
        
        <p>We received a request to reset your password. Use the following one-time password (OTP) to continue. This code will expire in 5 minutes.</p>
        
        <div class="otp-container" onclick="copyOTP()">
          <div class="otp-code" id="otp-code">${otp}</div>
          <div class="tooltip" id="tooltip">Click to copy</div>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        
        <div class="footer">
          <p>${config.app.name}</p>
          <p style="margin: 4px 0;">© ${new Date().getFullYear()} ${
    config.app.name
  }. All rights reserved.</p>
        </div>
      </div>
    </div>

    <script>
      function copyOTP() {
        const otp = document.getElementById('otp-code').innerText;
        const tooltip = document.getElementById('tooltip');
        
        navigator.clipboard.writeText(otp).then(() => {
          tooltip.innerText = 'Copied!';
          setTimeout(() => {
            tooltip.innerText = 'Click to copy';
          }, 2000);
        }).catch(() => {
          tooltip.innerText = 'Failed to copy';
          setTimeout(() => {
            tooltip.innerText = 'Click to copy';
          }, 2000);
        });
      }
    </script>
  </body>
</html>`;
};

module.exports = html;

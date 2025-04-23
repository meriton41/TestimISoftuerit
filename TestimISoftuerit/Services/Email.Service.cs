using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace TestimISoftuerit.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendVerificationEmailAsync(string toEmail, string encodedToken)
        {
            var smtpSettings = _config.GetSection("SmtpSettings");
            var fromAddress = smtpSettings["UserName"];
            var password = smtpSettings["Password"];
            var host = smtpSettings["Host"];
            var port = int.Parse(smtpSettings["Port"]);
            var enableSsl = bool.Parse(smtpSettings["EnableSsl"]);

            // Correct token usage, already encoded
            var verifyUrl = $"http://localhost:3000/verify-email?token={encodedToken}";

            // Updated HTML email template with button containing the verification link
            var htmlBody = $@"
            <!DOCTYPE html>
            <html>
            <head>
         <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ max-width: 300px; width: 100%; height: auto; }}
        .button {{ 
            background-color: #007bff; 
            color: #ffffff; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block; 
            margin: 15px 0;
            font-weight: bold;
        }}
        .footer {{ 
            margin-top: 30px; 
            font-size: 12px; 
            color: #777; 
            text-align: center;
        }}
        .code {{ 
            background: #f5f5f5; 
            padding: 10px; 
            word-break: break-all;
            font-family: monospace;
        }}
    </style>
</head>
<body>
    <div class=""header"">
        <img src=""https://i.pinimg.com/736x/e4/1f/c3/e41fc3eac93fd4d3f0682f0b97189666.jpg"" alt=""FinanceSyn logo"" class=""logo"">
    </div>

    <h2>Verifikim te llogaris</h2>
    <p>Hello,</p>
    <p>Thank you for registering with FinanceSync. Please verify your email address by clicking the button below:</p>

    <p>
        <a href=""{verifyUrl}"" style=""background-color: #007bff; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;"">Verify Email Address</a>
    </p>

    <p>If you didn't request this, please ignore this email.</p>

    <div class=""footer"">
        <p>© 2023 FinanceSync. All rights reserved.</p>
        <p>
            FinancSync Inc.<br>
            123 Auto Street, Tirana, Albania
        </p>
    </div>
</body>
</html>
";

            var message = new MailMessage(fromAddress, toEmail)
            {
                Subject = "Verify your email",
                Body = htmlBody,
                IsBodyHtml = true
            };

            using var smtp = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(fromAddress, password)
            };

            try
            {
                await smtp.SendMailAsync(message);
                Console.WriteLine("✅ Email sent successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send email: {ex.Message}");
                throw;
            }
        }
    }
}

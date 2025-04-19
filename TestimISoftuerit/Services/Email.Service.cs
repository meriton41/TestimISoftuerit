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

            // ✅ Correct token usage, already encoded
            var verifyUrl = $"http://localhost:3000/verify-email?token={encodedToken}";

            // ✅ FIXED HTML body: use double-double-quotes for quotes in a verbatim string
            var message = new MailMessage(fromAddress, toEmail)
            {
                Subject = "Verify your email",
                Body = $@"
                    <h2>Verify Your Email</h2>
                    <p>Click the link below to verify your account:</p>
                    <p><a href=""{verifyUrl}"">{verifyUrl}</a></p>",
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

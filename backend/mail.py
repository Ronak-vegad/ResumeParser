import os
import smtplib
from email.message import EmailMessage


def send_otp_email(to_email: str, otp: str, name: str) -> None:
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_addr = os.getenv("SMTP_FROM", smtp_user or "noreply@localhost")

    body = (
        f"Hi {name},\n\n"
        f"Your Persona verification code is: {otp}\n\n"
        f"This code expires in 15 minutes. If you did not request it, you can ignore this email.\n"
    )

    if not host or not smtp_user or not smtp_password:
        print(f"[EMAIL NOT CONFIGURED — OTP for {to_email}]: {otp}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Your Persona verification code"
    msg["From"] = from_addr
    msg["To"] = to_email
    msg.set_content(body)

    with smtplib.SMTP(host, port) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(msg)

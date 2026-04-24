"""Resend email integration. Gracefully degrades when API key is absent."""
import os
import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("email")


def _enabled() -> bool:
    user = os.environ.get("SMTP_USER", "").strip()
    pwd = os.environ.get("SMTP_PASSWORD", "").strip()
    return bool(user and pwd)


async def send_email(to: str, subject: str, html: str, text: str | None = None) -> bool:
    """Fire-and-forget email send via SMTP. Returns True if sent, False if skipped/failed."""
    if not _enabled():
        logger.info(f"[email-skip] no SMTP credentials; would send to={to} subject={subject!r}")
        return False
    if not to:
        return False
        
    user = os.environ.get("SMTP_USER", "").strip()
    pwd = os.environ.get("SMTP_PASSWORD", "").strip()
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = os.environ.get("SENDER_EMAIL", user)
    msg["To"] = to
    
    if text:
        msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))
    
    def _send():
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(user, pwd)
                server.send_message(msg)
            return True
        except Exception as e:
            logger.error(f"[email-error] to={to} subject={subject!r}: {e}")
            return False

    result = await asyncio.to_thread(_send)
    if result:
        logger.info(f"[email-sent] to={to}")
    return result


# ---------- Template helpers ----------

_BRAND = "BookSmart"
_PRIMARY = "#2563EB"
_DARK = "#0F172A"
_BG = "#F8FAFC"
_BORDER = "#E2E8F0"
_MUTED = "#64748B"


def _wrap(title: str, body_html: str, cta_label: str | None = None, cta_url: str | None = None) -> str:
    cta_block = ""
    if cta_label and cta_url:
        cta_block = f"""
        <tr><td align="left" style="padding:16px 0 0 0;">
          <a href="{cta_url}" style="background:{_PRIMARY};color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600;font-size:14px;font-family:Inter,Arial,sans-serif;display:inline-block;">{cta_label}</a>
        </td></tr>"""

    return f"""
<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title></head>
<body style="margin:0;padding:0;background:{_BG};font-family:Inter,Arial,sans-serif;color:{_DARK};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:{_BG};padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border:1px solid {_BORDER};border-radius:10px;overflow:hidden;">
      <tr><td style="padding:20px 28px;border-bottom:1px solid {_BORDER};">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:{_PRIMARY};font-weight:700;">{_BRAND}</div>
        <div style="font-size:20px;font-weight:800;color:{_DARK};margin-top:4px;">{title}</div>
      </td></tr>
      <tr><td style="padding:24px 28px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr><td style="font-size:14px;line-height:1.6;color:#334155;">
            {body_html}
          </td></tr>
          {cta_block}
        </table>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid {_BORDER};font-size:11px;color:{_MUTED};">
        Sent by {_BRAND} · If this wasn't you, please contact your admin.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>
"""


def tpl_booking_approved(user_name: str, resource: str, when: str, code: str, link: str) -> tuple[str, str]:
    subject = f"Booking approved — {resource}"
    code_block = ""
    if code:
        code_block = f"""
        <div style="background:{_BG};border:1px solid {_BORDER};border-radius:8px;padding:14px;">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:{_MUTED};font-weight:700;">6-digit check-in code</div>
          <div style="font-size:26px;font-weight:900;letter-spacing:0.3em;color:{_DARK};font-family:monospace;margin-top:4px;">{code}</div>
        </div>
        <br>"""
    
    body = f"""Hi <strong>{user_name}</strong>,<br><br>
        Your booking for <strong>{resource}</strong> on <strong>{when}</strong> is <strong style="color:#16A34A;">approved</strong>.<br><br>
        {code_block}
        Check-in opens 10 min before start. See you there."""
    
    if not code:
        body = f"""Hi <strong>{user_name}</strong>,<br><br>
        Your booking for <strong>{resource}</strong> on <strong>{when}</strong> is <strong style="color:#16A34A;">approved</strong>.<br><br>
        Please check your dashboard for the QR check-in code 10 minutes before your booked slot."""

    html = _wrap("Your booking is approved.", body, cta_label="Open booking", cta_url=link)
    return subject, html


def tpl_check_in_code_delivered(user_name: str, resource: str, code: str) -> tuple[str, str]:
    subject = f"Your check-in code for {resource}"
    html = _wrap(
        "Here is your check-in code.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        You have requested a check-in code for <strong>{resource}</strong>.<br><br>
        <div style="background:{_BG};border:1px solid {_BORDER};border-radius:8px;padding:14px;">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:{_MUTED};font-weight:700;">6-digit check-in code</div>
          <div style="font-size:26px;font-weight:900;letter-spacing:0.3em;color:{_DARK};font-family:monospace;margin-top:4px;">{code}</div>
        </div>
        <br>Enter this code in your dashboard to complete the check-in.""",
    )
    return subject, html


def tpl_check_in_notification_to_manager(manager_name: str, employee_name: str, resource: str, when: str) -> tuple[str, str]:
    subject = f"Check-in Alert: {employee_name} at {resource}"
    html = _wrap(
        "Employee Checked In",
        f"""Hi <strong>{manager_name}</strong>,<br><br>
        <strong>{employee_name}</strong> has just checked in for their booking at <strong>{resource}</strong>.<br><br>
        <strong>Time Slot:</strong> {when}""",
    )
    return subject, html


def tpl_booking_rejected(user_name: str, resource: str, when: str, note: str, link: str) -> tuple[str, str]:
    subject = f"Booking rejected — {resource}"
    note_block = f'<blockquote style="margin:12px 0;padding:10px 12px;border-left:3px solid {_BORDER};color:#334155;">{note}</blockquote>' if note else ""
    html = _wrap(
        "Your booking was rejected.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        Your booking for <strong>{resource}</strong> on <strong>{when}</strong> was <strong style="color:#DC2626;">rejected</strong>.{note_block}
        Feel free to try another slot or a different resource.""",
        cta_label="Find another slot",
        cta_url=link,
    )
    return subject, html


def tpl_check_in_warning(user_name: str, resource: str, when: str, link: str) -> tuple[str, str]:
    subject = f"Reminder: check in to {resource}"
    html = _wrap(
        "Please check in.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        You haven't checked in for your <strong>{resource}</strong> booking at <strong>{when}</strong>.
        If you don't check in within the next 10 minutes, it will be marked as a <strong style="color:#D97706;">no-show</strong>
        and affect your reliability score.""",
        cta_label="Check in now",
        cta_url=link,
    )
    return subject, html


def tpl_no_show(user_name: str, resource: str, when: str, link: str) -> tuple[str, str]:
    subject = f"Marked as no-show — {resource}"
    html = _wrap(
        "Marked as no-show.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        Your booking for <strong>{resource}</strong> on <strong>{when}</strong> was marked as a <strong style="color:#DC2626;">no-show</strong>.
        Your reliability score has been updated.""",
        cta_label="View booking",
        cta_url=link,
    )
    return subject, html


def tpl_maintenance_impact(user_name: str, resource: str, when: str, reason: str, link: str) -> tuple[str, str]:
    subject = f"Booking cancelled due to maintenance — {resource}"
    html = _wrap(
        "Your booking was cancelled.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        We've scheduled maintenance on <strong>{resource}</strong> that overlaps with your booking on <strong>{when}</strong>.
        The booking has been cancelled.<br><br>
        <blockquote style="margin:12px 0;padding:10px 12px;border-left:3px solid {_BORDER};color:#334155;">{reason or 'Scheduled maintenance'}</blockquote>""",
        cta_label="Find another slot",
        cta_url=link,
    )
    return subject, html


def tpl_extension_update(user_name: str, resource: str, approved: bool, link: str) -> tuple[str, str]:
    word = "approved" if approved else "rejected"
    color = "#16A34A" if approved else "#DC2626"
    subject = f"Extension {word} — {resource}"
    html = _wrap(
        f"Extension {word}.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        Your extension request for <strong>{resource}</strong> was <strong style="color:{color};">{word}</strong>.""",
        cta_label="Open booking",
        cta_url=link,
    )
    return subject, html


def tpl_approval_required(approver_name: str, requester: str, resource: str, when: str, link: str) -> tuple[str, str]:
    subject = f"Approval needed — {resource}"
    html = _wrap(
        "A booking needs your approval.",
        f"""Hi <strong>{approver_name}</strong>,<br><br>
        <strong>{requester}</strong> requested <strong>{resource}</strong> on <strong>{when}</strong>.
        Please review it in the approval queue.""",
        cta_label="Open approval queue",
        cta_url=link,
    )
    return subject, html


def tpl_account_approved(user_name: str, link: str) -> tuple[str, str]:
    subject = "Welcome to clickAway — Account Approved"
    html = _wrap(
        "Your account is approved.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        Great news! Your account registration for clickAway has been <strong style="color:#16A34A;">approved</strong>.
        You can now log in and start booking resources.""",
        cta_label="Explore clickAway",
        cta_url=link,
    )
    return subject, html


def tpl_account_rejected(user_name: str) -> tuple[str, str]:
    subject = "clickAway — Account Rejected"
    html = _wrap(
        "Your account registration was rejected.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        We're sorry, but your recent account registration request for clickAway was <strong style="color:#DC2626;">rejected</strong> by the manager or administrator.
        <br><br>Please contact your administrator if you believe this was a mistake.""",
    )
    return subject, html


def tpl_account_deleted(user_name: str, reason: str) -> tuple[str, str]:
    subject = "clickAway — Account Deleted"
    html = _wrap(
        "Your account was deleted.",
        f"""Hi <strong>{user_name}</strong>,<br><br>
        Your account on clickAway has been <strong style="color:#DC2626;">deleted</strong> by an administrator.<br><br>
        <strong>Reason:</strong><br>
        <blockquote style="margin:12px 0;padding:10px 12px;border-left:3px solid {_BORDER};color:#334155;">{reason or 'No reason provided.'}</blockquote>
        <br>If you believe this was an error, please contact your IT department.""",
    )
    return subject, html
 
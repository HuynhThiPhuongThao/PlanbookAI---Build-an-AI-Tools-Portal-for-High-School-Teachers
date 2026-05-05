import base64
import json
import os
from typing import Iterable

import firebase_admin
import httpx
from firebase_admin import credentials, messaging


TYPE_CONTENT_SUBMITTED = "CONTENT_SUBMITTED"
TYPE_CONTENT_APPROVED = "CONTENT_APPROVED"
TYPE_CONTENT_REJECTED = "CONTENT_REJECTED"

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8082")


def _ensure_firebase_app() -> bool:
    if firebase_admin._apps:
        return True

    try:
        service_account_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64", "").strip()
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
        service_account_file = "/app/secrets/firebase-adminsdk.json"

        if service_account_base64:
            raw = base64.b64decode(service_account_base64).decode("utf-8")
            cred = credentials.Certificate(json.loads(raw))
        elif service_account_json:
            cred = credentials.Certificate(json.loads(service_account_json))
        elif os.path.exists(service_account_file):
            cred = credentials.Certificate(service_account_file)
        else:
            print("[Firebase FCM] Missing service account config.")
            return False

        firebase_admin.initialize_app(cred)
        print("[Firebase FCM] Admin SDK initialized in ai-service.")
        return True
    except Exception as exc:
        print(f"[Firebase FCM] Init failed in ai-service: {exc}")
        return False


def _send_notification(token: str, title: str, body: str, notification_type: str, data: dict[str, str]) -> None:
    if not token or not token.strip() or not _ensure_firebase_app():
        return

    try:
        message = messaging.Message(
            token=token.strip(),
            notification=messaging.Notification(title=title, body=body),
            data={"type": notification_type, **{k: str(v) for k, v in data.items()}},
        )
        response = messaging.send(message)
        print(f"[Firebase FCM] Prompt notification sent: {response}")
    except Exception as exc:
        print(f"[Firebase FCM] Prompt send failed: {exc}")


def _send_to_many(tokens: Iterable[str], title: str, body: str, notification_type: str, data: dict[str, str]) -> None:
    seen: set[str] = set()
    for token in tokens or []:
        cleaned = (token or "").strip()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            _send_notification(cleaned, title, body, notification_type, data)


def _get_json_list(url: str) -> list[str]:
    try:
        response = httpx.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, list) else []
    except Exception as exc:
        print(f"[Firebase FCM] Cannot load token list from {url}: {exc}")
        return []


def _get_text(url: str) -> str:
    try:
        response = httpx.get(url, timeout=5)
        response.raise_for_status()
        return response.text.strip()
    except Exception as exc:
        print(f"[Firebase FCM] Cannot load token from {url}: {exc}")
        return ""


def notify_managers_prompt_submitted(prompt_id: int, prompt_name: str) -> None:
    tokens = _get_json_list(f"{USER_SERVICE_URL}/api/users/internal/managers/fcm-tokens")
    _send_to_many(
        tokens,
        "[CẦN DUYỆT] Mẫu lời nhắc AI mới",
        f"Staff vừa gửi duyệt mẫu lời nhắc: {prompt_name}",
        TYPE_CONTENT_SUBMITTED,
        {
            "contentKind": "PROMPT",
            "promptId": str(prompt_id),
            "promptTitle": prompt_name,
        },
    )


def notify_staff_prompt_reviewed(staff_id: str | None, prompt_id: int, prompt_name: str, approved: bool, review_note: str = "") -> None:
    if not staff_id or not str(staff_id).isdigit():
        return

    token = _get_text(f"{USER_SERVICE_URL}/api/users/internal/{staff_id}/fcm-token")
    notification_type = TYPE_CONTENT_APPROVED if approved else TYPE_CONTENT_REJECTED
    _send_notification(
        token,
        "[ĐÃ DUYỆT] Mẫu lời nhắc AI" if approved else "[TỪ CHỐI] Mẫu lời nhắc AI",
        f"Mẫu lời nhắc đã được duyệt: {prompt_name}" if approved else f"Lý do: {review_note or 'Cần chỉnh sửa'} - Mẫu: {prompt_name}",
        notification_type,
        {
            "contentKind": "PROMPT",
            "promptId": str(prompt_id),
            "promptTitle": prompt_name,
            "reviewNote": review_note or "",
        },
    )

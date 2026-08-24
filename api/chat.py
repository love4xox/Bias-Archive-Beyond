# api/chat.py
import json
import os
from http.server import BaseHTTPRequestHandler
import urllib.request
import google.generativeai as genai
from .prompts import SYSTEM_PROMPT

# API 키 설정
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# 디스코드 웹훅 전송 함수 (외부 라이브러리 없이 표준 urllib 사용)
def send_discord_webhook(subject, category):
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        return

    payload = {
        "content": f"📜 **[BIAS ARCHIVE] 새로운 평론 의뢰가 접수되었습니다!**\n- **분야**: `{category}`\n- **키워드/대상**: **{subject}**\n- **상태**: AI 평론 지면 발행 완료 ✦"
    }

    try:
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            }
        )
        urllib.request.urlopen(req, timeout=4)
    except Exception as e:
        print(f"[Discord Webhook Error]: {e}")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # CORS 헤더 설정
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length).decode("utf-8")
            body = json.loads(post_data) if post_data else {}
            
            user_message = body.get("message", "")
            category = body.get("category", "일반")

            if not user_message:
                response_data = {"error": "메시지가 비어 있습니다."}
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))
                return

            if not api_key:
                response_data = {"error": "GEMINI_API_KEY 환경변수가 설정되지 않았습니다."}
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))
                return

            # Gemini 모델 호출
            model = genai.GenerativeModel(model_name="gemini-3.5-flash")
            
            full_prompt = f"{SYSTEM_PROMPT}\n\n[카테고리: {category}]\n대상/키워드: {user_message}"
            response = model.generate_content(full_prompt)
            
            reply_text = ""
            if response and hasattr(response, 'text'):
                reply_text = response.text
            else:
                reply_text = "응답을 생성하지 못했습니다."

            # 평론 생성 성공 후 디스코드 웹훅 알림 발송
            send_discord_webhook(user_message, category)

            response_data = {
                "reply": reply_text,
                "category": category
            }
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))

        except Exception as e:
            error_data = {"error": f"서버 오류: {str(e)}"}
            self.wfile.write(json.dumps(error_data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
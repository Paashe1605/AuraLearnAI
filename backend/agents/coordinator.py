from google import genai
from pydantic import BaseModel
import json
import os
import sys

# Add the parent directory to the path so we can import the MCP tool
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mcp_servers.youtube_mcp import search_youtube

# Initialize GenAI Client
try:
    client = genai.Client(
        enterprise=True, 
        project="auralearn-backend", 
        location="global"
    )
except Exception as e:
    print(f"Agent Platform not authenticated: {e}")
    client = None

class AgentResponse(BaseModel):
    success: bool
    data: dict
    message: str

class Coordinator:
    def __init__(self):
        pass

    def process_learning_request(self, topic: str, language: str) -> AgentResponse:
        """Runs the native Agent workflow."""
        if not client:
            return AgentResponse(
                success=True,
                data={
                    "beginner_video": {"video_id": "dQw4w9WgXcQ"}, 
                    "intermediate_video": {"video_id": "dQw4w9WgXcQ"}, 
                    "advanced_video": {"video_id": "dQw4w9WgXcQ"}, 
                    "playlist": {"video_id": "PLX8b4c-9f-nJ0h5hO1k3eFj0Yq90WpIom"}, # mock playlist id
                    "original_summary": f"1. Why: It is crucial to understand {topic}.\n2. What: It is a core concept.\n3. Who: Designed for students.",
                    "translated_summary": f"**[Mocked Translation in {language}]**\n\n{topic} is important.\n- Bullet 1\n- Bullet 2",
                    "translated_topic": f"[Mocked {topic}]",
                    "audio_script": f"Welcome to the mock audio script for {topic} in {language}.",
                    "mermaid_diagram": "graph TD;\n A-->B;",
                    "image_url": "https://image.pollinations.ai/prompt/Agentic%20AI%20futuristic%20concept"
                },
                message="Mock workflow completed."
            )

        print(f"Starting Native Agent Workflow for '{topic}' in '{language}'...")

        prompt = f"""You are a specialized Educational Curator Agent. 
        Your goal is to find the absolute BEST, most highly recommended YouTube videos about '{topic}' and summarize the topic.
        
        You MUST use the search_educational_videos tool multiple times. You need:
        1. The best 'beginner' video on the topic.
        2. The best 'intermediate' video on the topic.
        3. The best 'advanced' video on the topic.
        4. The best 'playlist' on the topic (set search_type to 'playlist').
        
        You must also generate a descriptive prompt for an AI Image Generator that visually represents the core concept of '{topic}'.
        You must also generate a Mermaid.js diagram code explaining the topic structurally.
        
        After gathering all info, output a JSON object exactly matching this schema (DO NOT WRAP IN MARKDOWN, just raw JSON):
        {{
            "beginner_video_id": "youtube video id",
            "intermediate_video_id": "youtube video id",
            "advanced_video_id": "youtube video id",
            "playlist_id": "youtube playlist id",
            "summary": "A beautiful, deeply insightful summary of the topic in {language} with markdown formatting. Make it look professional and legendary grade. Use bullet points and bold text effectively.",
            "translated_topic": "The user's query '{topic}' translated into {language}.",
            "audio_script": "A short, highly engaging, and conversational audio script summarizing {topic} specifically designed to be read aloud as a podcast/voiceover in {language}.",
            "image_prompt": "A descriptive prompt for generating an AI image for {topic}.",
            "mermaid_diagram": "valid mermaid.js code block for a diagram explaining {topic}"
        }}
        """

        import time
        max_retries = 3
        response = None
        
        for attempt in range(max_retries):
            try:
                # Native Agent execution with tool binding!
                response = client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=prompt,
                    config={'tools': [search_youtube]}
                )
                break
            except Exception as e:
                if ("429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)) and attempt < max_retries - 1:
                    print(f"Rate limited. Retrying in {2 ** attempt} seconds...")
                    time.sleep(2 ** attempt)
                else:
                    print(f"Workflow failed: {e}")
                    return AgentResponse(
                        success=False,
                        data={},
                        message=f"Agent workflow crashed: {str(e)}"
                    )
            
        try:
            result_json = response.text.strip()
            if result_json.startswith("```json"):
                result_json = result_json[7:-3].strip()
            elif result_json.startswith("```"):
                result_json = result_json[3:-3].strip()
            
            data = json.loads(result_json)
            
            import urllib.parse
            image_prompt = data.get("image_prompt", f"Educational illustration about {topic}")
            image_url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(image_prompt)}"
            
            return AgentResponse(
                success=True,
                data={
                    "beginner_video": {"video_id": data.get("beginner_video_id", "dQw4w9WgXcQ")},
                    "intermediate_video": {"video_id": data.get("intermediate_video_id", "dQw4w9WgXcQ")},
                    "advanced_video": {"video_id": data.get("advanced_video_id", "dQw4w9WgXcQ")},
                    "playlist": {"video_id": data.get("playlist_id", "")},
                    "original_summary": data.get("summary", "Summary not generated."),
                    "translated_summary": data.get("summary", "Summary not generated."),
                    "translated_topic": data.get("translated_topic", topic),
                    "audio_script": data.get("audio_script", data.get("summary", "Summary not generated.")),
                    "mermaid_diagram": data.get("mermaid_diagram", ""),
                    "image_url": image_url
                },
                message="Workflow completed successfully."
            )
            
        except Exception as e:
            print(f"Parsing failed: {e}")
            return AgentResponse(
                success=False,
                data={},
                message=f"Agent response parsing crashed: {str(e)}"
            )

    def translate_ui(self, target_language: str, ui_payload: dict) -> AgentResponse:
        if not client:
            return AgentResponse(success=True, data=ui_payload, message="Fallback to English.")

        prompt = f"""You are a localization agent. Translate the values of the following JSON dictionary into {target_language}.
        Keep the exact same JSON keys. ONLY output the JSON dictionary, nothing else.
        
        {json.dumps(ui_payload, indent=2)}
        """

        import time
        max_retries = 3
        response = None
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=prompt,
                )
                break
            except Exception as e:
                if ("429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)) and attempt < max_retries - 1:
                    print(f"Translation rate limited. Retrying in {2 ** attempt} seconds...")
                    time.sleep(2 ** attempt)
                else:
                    print(f"Translation error: {e}")
                    return AgentResponse(
                        success=False,
                        data=ui_payload,
                        message=f"Translation failed: {str(e)}"
                    )

        try:
            translated_dict = json.loads(response.text.strip("```json").strip("```").strip())
            
            return AgentResponse(
                success=True,
                data=translated_dict,
                message=f"Successfully translated to {target_language}"
            )
        except Exception as e:
            print(f"Translation parsing error: {e}")
            return AgentResponse(
                success=False,
                data=ui_payload,
                message=f"Translation parsing failed: {str(e)}"
            )

coordinator = Coordinator()

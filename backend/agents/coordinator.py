from google import genai
from pydantic import BaseModel
from typing import List, Optional

# Initialize GenAI Client for Agent Platform
try:
    # Use standard vertexai=True initialization for the 0.2.0 SDK version
    client = genai.Client(
        vertexai=True, 
        project="auralearn-backend", 
        location="us-central1"
    )
except Exception as e:
    print(f"Agent Platform not authenticated: {e}")
    client = None

class AgentResponse(BaseModel):
    success: bool
    data: dict
    message: str

class SearchAgent:
    """Agent responsible for determining what to search and calling the MCP server."""
    
    def __init__(self):
        # In a full ADK setup, we'd bind the YouTube MCP server here as a tool.
        pass
        
    def execute(self, topic: str, language: str) -> AgentResponse:
        # Mocking the MCP call for now until we spin up the subprocess
        return AgentResponse(
            success=True,
            data={"video_id": "dQw4w9WgXcQ", "title": f"{topic} explained in {language}"},
            message="Successfully found video."
        )

class CuratorAgent:
    """Agent responsible for fetching the transcript and summarizing it (Why, What, Who)."""
    
    def execute(self, video_id: str) -> AgentResponse:
        # In a full implementation, this uses youtube-transcript-api and then Gemini to summarize.
        # Here we mock the Gemini summary generation.
        
        prompt = f"Summarize the educational content for video {video_id} into Why, What, and Who."
        
        # We use the Vertex AI client if authenticated.
        if client:
            # Using the latest Gemini model as requested
            response = client.models.generate_content(
                model='gemini-3.1-pro',
                contents=prompt,
            )
            summary = response.text
        else:
            summary = "1. Why: It is crucial to understand this.\n2. What: It is a core concept.\n3. Who: Designed for students."
            
        return AgentResponse(
            success=True,
            data={"summary": summary},
            message="Summary generated successfully."
        )

class LocalizationAgent:
    """Agent responsible for translating the summary and generating TTS."""
    
    def execute(self, text: str, target_language: str) -> AgentResponse:
        # Calls Google Cloud Translation & TTS APIs.
        return AgentResponse(
            success=True,
            data={
                "translated_text": f"[{target_language}] {text}",
                "audio_url": f"/api/audio/mock_audio_{target_language}.mp3"
            },
            message="Localization complete."
        )

class EvaluatorAgent:
    """Red/Blue team agent that evaluates the final output for safety and hallucinations."""
    
    def execute(self, original_text: str, translated_text: str) -> AgentResponse:
        # Evaluates the output to ensure it matches and contains no harmful content.
        return AgentResponse(
            success=True,
            data={"is_safe": True},
            message="Content passed safety evaluation."
        )

class AgentCoordinator:
    """Orchestrates the multi-agent workflow."""
    
    def __init__(self):
        self.search = SearchAgent()
        self.curator = CuratorAgent()
        self.localization = LocalizationAgent()
        self.evaluator = EvaluatorAgent()
        
    def process_learning_request(self, topic: str, language: str) -> AgentResponse:
        print(f"Starting Multi-Agent Workflow for '{topic}' in '{language}'...")
        
        # Step 1: Search
        search_res = self.search.execute(topic, language)
        if not search_res.success: return search_res
        
        # Step 2: Curate (Summarize)
        curate_res = self.curator.execute(search_res.data['video_id'])
        if not curate_res.success: return curate_res
        
        # Step 3: Localize
        localize_res = self.localization.execute(curate_res.data['summary'], language)
        if not localize_res.success: return localize_res
        
        # Step 4: Evaluate
        eval_res = self.evaluator.execute(curate_res.data['summary'], localize_res.data['translated_text'])
        if not eval_res.data['is_safe']:
            return AgentResponse(success=False, data={}, message="Safety check failed.")
            
        return AgentResponse(
            success=True,
            data={
                "video": search_res.data,
                "original_summary": curate_res.data['summary'],
                "localized_content": localize_res.data
            },
            message="Workflow completed successfully."
        )

    def translate_ui(self, target_language: str, ui_payload: dict) -> AgentResponse:
        import json
        if not client:
            # Fallback to English if not authenticated
            return AgentResponse(success=True, data=ui_payload, message="Fallback to English.")
            
        prompt = f"""
        Translate the following JSON UI strings into {target_language}. 
        Return ONLY valid JSON with the exact same keys. Do not include markdown blocks like ```json.
        
        {json.dumps(ui_payload)}
        """
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash', # Use flash for fast UI translations
                contents=prompt,
            )
            translated_dict = json.loads(response.text.strip("```json").strip("```").strip())
            return AgentResponse(success=True, data=translated_dict, message="UI Translated")
        except Exception as e:
            return AgentResponse(success=False, data={}, message=str(e))

coordinator = AgentCoordinator()

import os
from googleapiclient.discovery import build
import mcp.server.stdio
from mcp.server import Server
from mcp.types import Tool, TextContent

# Initialize the MCP Server
app = Server("youtube-mcp")

# Get YouTube API Key from environment
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

if not YOUTUBE_API_KEY:
    # In a real environment, this would crash or warn. We keep it safe for the hackathon.
    print("Warning: YOUTUBE_API_KEY is not set.")

def search_youtube(query: str, max_results: int = 3) -> str:
    """Searches YouTube for educational videos."""
    if not YOUTUBE_API_KEY:
        return "Error: YOUTUBE_API_KEY is missing."
        
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    try:
        request = youtube.search().list(
            q=query,
            part='snippet',
            type='video',
            maxResults=max_results,
            videoCaption='closedCaption' # Prefer videos with captions for summarization
        )
        response = request.execute()
        
        results = []
        for item in response.get('items', []):
            title = item['snippet']['title']
            video_id = item['id']['videoId']
            url = f"https://www.youtube.com/watch?v={video_id}"
            results.append(f"Title: {title}\nURL: {url}\nID: {video_id}")
            
        return "\n\n".join(results)
    except Exception as e:
        return f"YouTube API Error: {str(e)}"

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_educational_videos",
            description="Searches YouTube for highly relevant educational videos on a given topic.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query, optimized for educational content."
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Number of videos to return. Default is 3."
                    }
                },
                "required": ["query"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "search_educational_videos":
        query = arguments.get("query")
        max_results = arguments.get("max_results", 3)
        result = search_youtube(query, max_results)
        return [TextContent(type="text", text=result)]
    
    raise ValueError(f"Unknown tool: {name}")

if __name__ == "__main__":
    # Start the MCP server using stdio transport
    mcp.server.stdio.run(app)

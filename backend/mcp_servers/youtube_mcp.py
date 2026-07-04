import os
from googleapiclient.discovery import build

# Get YouTube API Key from environment
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

if not YOUTUBE_API_KEY:
    # In a real environment, this would crash or warn. We keep it safe for the hackathon.
    print("Warning: YOUTUBE_API_KEY is not set.")

def search_youtube(query: str, search_type: str = 'video', max_results: int = 1) -> str:
    """Searches YouTube for educational videos or playlists."""
    if not YOUTUBE_API_KEY:
        return "Error: YOUTUBE_API_KEY is missing."
        
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    try:
        request = youtube.search().list(
            q=query,
            part='snippet',
            type=search_type,
            maxResults=max_results,
            videoCaption='closedCaption' if search_type == 'video' else 'any'
        )
        response = request.execute()
        
        results = []
        for item in response.get('items', []):
            title = item['snippet']['title']
            
            if search_type == 'playlist':
                item_id = item['id']['playlistId']
                url = f"https://www.youtube.com/playlist?list={item_id}"
            else:
                item_id = item['id']['videoId']
                url = f"https://www.youtube.com/watch?v={item_id}"
                
            results.append(f"Title: {title}\nURL: {url}\nID: {item_id}")
            
        return "\n\n".join(results)
    except Exception as e:
        return f"YouTube API Error: {str(e)}"

if __name__ == "__main__":
    import mcp.server.stdio
    from mcp.server import Server
    from mcp.types import Tool, TextContent

    app = Server("youtube-mcp")

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
                        "search_type": {
                            "type": "string",
                            "enum": ["video", "playlist"],
                            "description": "The type of search to perform. Defaults to 'video'."
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Number of videos to return. Default is 1."
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
            search_type = arguments.get("search_type", "video")
            max_results = arguments.get("max_results", 1)
            result = search_youtube(query, search_type, max_results)
            return [TextContent(type="text", text=result)]
        
        raise ValueError(f"Unknown tool: {name}")

    # Start the MCP server using stdio transport
    mcp.server.stdio.run(app)

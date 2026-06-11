from google.adk.agents import LlmAgent
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context
from google.adk.tools import VertexAiSearchTool
from google.genai import types

from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool import StreamableHTTPConnectionParams
from fastmcp import FastMCP

mcp = FastMCP("Demo 🚀")

def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    mcp.run()


#folder that mcp server can access
TARGET_FOLDER_PATH = "/path/to/your/folder"

mongodbToolset = McpToolset(
    connection_params=StreamableHTTPConnectionParams(
        url="https://your-mcp-server.com/mcp",
        headers={"Authorization": "Bearer your-key"}
    )
)

spaceDataAssistant = LlmAgent(
    model="gemini-flash-latest",
    name="spaceDataAssistant",
    description="An agent that summarizes json data and provides a concise and accurate answer based on user's questions about the data provided.",
    instruction="You are a helpful assistant ready to answer any questions regarding NASA space data. "
    "When a user asks questions regarding Near Earth Object (NEO), satellite, or launch data: "
    "1. Use the `find` tool to query the MongoDB database for relevant documents. "
    "2. Search the appropriate collection based on the user's question: "
    "   - NEO questions → 'near_earth_object_data' collection "
    "   - Satellite questions → 'satellites' collection "
    "   - Launch questions → 'launches' collection "
    "3. Apply filters based on the user's question (e.g. hazardous status, close approach date, size, velocity, orbit type, launch date). "
    "4. Summarize the returned data in a concise, accurate answer tailored to the user's question.",
    tools=[mongodbToolset],
    # generate_content_config=types.GenerateContentConfig(
    #     safety_settings=[
    #         types.SafetySetting(
    #             category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    #             threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    #         )
    #     ]
    # ),
    include_contents='default' # Control whether the agent receives the prior conversation history.
)
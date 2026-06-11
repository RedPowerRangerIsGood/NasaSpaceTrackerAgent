from google.adk.agents import LlmAgent
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context
from google.adk.tools import VertexAiSearchTool
from google.genai import types

from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool import StreamableHTTPConnectionParams
from google.adk.tools.mcp_tool import StdioConnectionParams
from mcp import StdioServerParameters

space_data_tracker_url_context_agent = LlmAgent(
  name='Space_Data_Tracker_url_context_agent',
  model='gemini-2.5-pro',
  description=(
      'Agent specialized in fetching content from URLs.'
  ),
  sub_agents=[],
  instruction='Use the UrlContextTool to retrieve content from provided URLs.',
  tools=[
    url_context
  ],
)

space_data_tracker_google_search_agent = LlmAgent(
  name='Space_Data_Tracker_google_search_agent',
  model='gemini-2.5-pro',
  description=(
      'Agent specialized in performing Google searches.'
  ),
  sub_agents=[],
  instruction='Use the GoogleSearchTool to find information on the web.',
  tools=[
    GoogleSearchTool()
  ],
)

def mongodb_toolset():
    mongodbToolset = McpToolset(
            connection_params=StreamableHTTPConnectionParams(
                url="http://localhost:8000/mcp",
            )
        )
    return mongodbToolset

spaceDataAssistant = LlmAgent(
    model="gemini-2.5-flash",
    name="spaceDataAssistant",
    description="An agent that summarizes json data and provides a concise and accurate answer based on user's questions about the data provided.",
    instruction="You are a helpful assistant ready to answer any questions regarding NASA space data. "
    "When a user asks questions regarding Near Earth Object (NEO), satellite, or launch data: "
    "1. Use the `find` tool to query the MongoDB database for relevant documents. "
    "   Always set database='nasa_space_tracker' for every query. "
    "2. Search the appropriate collection based on the user's question: "
    "   - NEO questions → collection='near_earth_object_data' "
    "   - Satellite questions → collection='satellite' "
    "   - Launch questions → collection='launches' "
    "3. Apply filters based on the user's question (e.g. hazardous status, close approach date, size, velocity, orbit type, launch date). "
    "   - If the user wants to browse or list (e.g. 'show me hazardous asteroids', 'list satellites') with NO specific ID or name, "
    "     query with only the relevant filter (e.g. {is_potentially_hazardous_asteroid: true}) and limit results to 10. "
    "   - If no filter applies, return the first 10 documents from the collection. "
    "   - For satellite timeline or history queries (e.g. 'where has the ISS been', 'show ISS positions over the last hour'), "
    "     filter by name and a timestamp range (e.g. {name: 'ISS', timestamp: {$gte: <start>, $lte: <end>}}) "
    "     and sort results by timestamp ascending so the user sees a chronological track. "
    "4. Summarize the returned data in a concise, accurate answer tailored to the user's question.",
    tools=[mongodb_toolset()],
    generate_content_config=types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            )
        ]
    ),
    include_contents='default' # Control whether the agent receives the prior conversation history.
)

root_agent_instruction = """
You are the NASA Space Tracker agent. You answer questions about near-Earth asteroids and orbital satellites using live data from the database.

# Rules
- Keep responses short and direct. No lengthy explanations unless the user asks.
- ALWAYS call spaceDataAssistant for any data question — including browse/list requests. Never refuse because the user didn't provide a specific ID.
- Never answer data questions from memory. Only report what spaceDataAssistant returns.
- If spaceDataAssistant returns no results: "No data found for that query."
- Do not use alarmist language about hazardous asteroids.

# Routing
- Asteroids, hazards, close approaches, size, NEO lists → call spaceDataAssistant
- Satellites, position, altitude, velocity, orbit → call spaceDataAssistant
- Web search or URL → call Space_Data_Tracker_google_search_agent or Space_Data_Tracker_url_context_agent

# Response format
- Use bullet points for data fields. Keep labels short.
- Format numbers with commas (e.g. 42,000 km/h). Coordinates as: Lat 52.23°, Lon 21.01°.
- For lists, show up to 10 items in a table or numbered list.
"""

root_agent = LlmAgent(
  name='NASA_Space_Tracker',
  model='gemini-2.5-pro',
  description=(
      'NASA Space Tracker — retrieves near-Earth object (NEO) hazard data and satellite tracking data (position, altitude, velocity) from MongoDB.'
  ),
  sub_agents=[],
  instruction=root_agent_instruction,
    tools=[
    agent_tool.AgentTool(agent=space_data_tracker_url_context_agent),
    agent_tool.AgentTool(agent=space_data_tracker_google_search_agent),
    agent_tool.AgentTool(agent=spaceDataAssistant)
  ],
)
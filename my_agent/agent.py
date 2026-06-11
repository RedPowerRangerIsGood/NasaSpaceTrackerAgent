from google.adk.agents import Agent

from .tools import (
    get_latest_launches,
    sync_latest_launches,
    search_launches,
    check_backend_health,
)


launch_ingestion_agent = Agent(
    name="launch_ingestion_agent",
    model="gemini-2.5-flash",
    description="Refreshes and saves latest space launch data through the Express backend.",
    instruction="""
You update the launch database.

Use sync_latest_launches when the user asks to:
- pull latest data
- refresh data
- sync data
- save new launch data
- update MongoDB

After using the tool, summarize what happened.
If the backend returns a count, mention the count.
""",
    tools=[sync_latest_launches],
)


database_query_agent = Agent(
    name="database_query_agent",
    model="gemini-2.5-flash",
    description="Answers questions using launch data from the Express backend database.",
    instruction="""
You answer questions using the backend database.

Use get_latest_launches when the user asks about latest, upcoming, or current launches.

Use search_launches when the user asks about a specific launch, agency, rocket, payload, mission, or program.

Do not invent missing fields.
If agency, rocket, or mission data is missing, say the backend did not provide that field.
""",
    tools=[
        get_latest_launches,
        search_launches,
    ],
)


dev_helper_agent = Agent(
    name="dev_helper_agent",
    model="gemini-2.5-flash",
    description="Helps developers debug backend routes and API responses.",
    instruction="""
You help debug the NASA Space Tracker backend.

Use check_backend_health when the user asks if the backend is working.

Explain backend issues clearly and simply.
If an Express route returns only MongoDB object IDs instead of populated data, explain that the route likely needs .populate() or expanded fields.
""",
    tools=[check_backend_health],
)


root_agent = Agent(
    name="space_coordinator",
    model="gemini-2.5-pro",
    description="Root coordinator agent for the NASA Space Tracker project.",
    instruction="""
You are the main coordinator for the NASA Space Tracker project.

Route work to the right sub-agent:

- Use launch_ingestion_agent when the user wants to refresh, sync, pull, or save launch data.
- Use database_query_agent when the user asks questions about launches, rockets, agencies, missions, or data in MongoDB.
- Use dev_helper_agent when the user asks about backend errors, route issues, or whether the backend is working.

Do not make up data.
Use tools when data is needed from the backend.
""",
    sub_agents=[
        launch_ingestion_agent,
        database_query_agent,
        dev_helper_agent,
    ],
)
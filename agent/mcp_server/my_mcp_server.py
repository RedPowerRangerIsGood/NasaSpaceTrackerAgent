import os
from pathlib import Path
from dotenv import load_dotenv
from fastmcp.server import create_proxy
from fastmcp.client import Client
from fastmcp.client.transports import StdioTransport
from starlette.requests import Request
from starlette.responses import HTMLResponse

load_dotenv(Path(__file__).parent / ".env")

transport = StdioTransport(
    command="npx",
    args=["-y", "mongodb-mcp-server@latest"],
    env={
        "MDB_MCP_CONNECTION_STRING": os.environ["MDB_MCP_CONNECTION_STRING"],
        "MDB_MCP_API_CLIENT_ID":     os.environ["MDB_MCP_API_CLIENT_ID"],
        "MDB_MCP_API_CLIENT_SECRET": os.environ["MDB_MCP_API_CLIENT_SECRET"],
    },
)

mcp = create_proxy(Client(transport), name="MongoDB MCP Proxy")

@mcp.custom_route("/", methods=["GET"])
async def index(request: Request) -> HTMLResponse:
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
      <head><title>NASA Space Tracker MCP Server</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h1>NASA Space Tracker MCP Server</h1>
        <p>Status: <strong>Running</strong></p>
        <p>MCP endpoint: <code>/mcp</code></p>
        <p>Proxying: <code>mongodb-mcp-server</code> via stdio</p>
      </body>
    </html>
    """)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    mcp.run(transport="http", host="0.0.0.0", port=port)

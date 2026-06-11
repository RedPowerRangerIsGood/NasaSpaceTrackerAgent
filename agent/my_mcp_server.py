import os
from pathlib import Path
from dotenv import load_dotenv
from fastmcp.server import create_proxy
from fastmcp.client import Client
from fastmcp.client.transports import StdioTransport

load_dotenv(Path(__file__).parent / "my_agent" / ".env")

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

if __name__ == "__main__":
    mcp.run(transport="http", port=8000)

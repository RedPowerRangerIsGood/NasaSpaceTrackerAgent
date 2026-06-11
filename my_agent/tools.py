import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Your Express backend is running on port 8080.
# This also lets .env override it with EXPRESS_API_BASE_URL=http://localhost:8080
BASE_URL = os.getenv("EXPRESS_API_BASE_URL", "http://localhost:8080")


def _safe_get(path: str, timeout: int = 30) -> dict:
    """
    Helper function to safely call GET routes on the Express backend.
    """
    url = f"{BASE_URL}{path}"

    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()

        try:
            return response.json()
        except Exception:
            return {
                "error": True,
                "message": f"Backend returned non-JSON response from {url}",
                "raw_response": response.text[:500],
            }

    except requests.exceptions.ConnectionError:
        return {
            "error": True,
            "message": f"Could not connect to backend at {url}. Make sure Express is running on {BASE_URL}.",
        }

    except requests.exceptions.Timeout:
        return {
            "error": True,
            "message": f"Request to backend timed out at {url}.",
        }

    except requests.exceptions.HTTPError as e:
        return {
            "error": True,
            "message": f"Backend route returned an HTTP error at {url}: {str(e)}",
            "status_code": response.status_code,
            "raw_response": response.text[:500],
        }

    except Exception as e:
        return {
            "error": True,
            "message": f"Unexpected error calling backend at {url}: {str(e)}",
        }


def check_backend_health() -> dict:
    """
    Check whether the Express backend is online.
    Use this when debugging backend connection problems.
    """
    return _safe_get("/api/health", timeout=10)


def get_latest_launches() -> dict:
    """
    Get the latest launch data from the Express backend.

    Important:
    The current backend route /launches pulls launch data from Launch Library,
    saves it to MongoDB, and returns the saved launches.

    Use this when the user asks about latest launches, upcoming launches,
    missions, rockets, or agencies.
    """
    return _safe_get("/launches", timeout=30)


def sync_latest_launches() -> dict:
    """
    Pull fresh launch data from the Express backend and save it to MongoDB.

    The backend currently uses GET /launches for syncing launch data.
    Use this when the user asks to refresh, sync, pull, save, or update launch data.
    """
    return _safe_get("/launches", timeout=30)


def get_spacex_launches() -> dict:
    """
    Get upcoming SpaceX launch data from the Express backend.
    Use this when the user asks about SpaceX launches.
    """
    return _safe_get("/spacex-launches", timeout=30)


def get_nasa_data() -> dict:
    """
    Get NASA data from the Express backend.
    Use this when the user asks for NASA data or NASA space information.
    """
    return _safe_get("/nasa", timeout=30)


def get_space_news() -> dict:
    """
    Get latest space news from the Express backend.
    Use this when the user asks for space news or recent space articles.
    """
    return _safe_get("/space-news", timeout=30)


def get_iss_location() -> dict:
    """
    Get the current ISS location from the Express backend.
    Use this when the user asks where the ISS is right now.
    """
    return _safe_get("/iss-location", timeout=30)


def search_launches(query: str) -> dict:
    """
    Search launch data by keyword.

    Your backend does not currently have a real /api/launches/search route,
    so this function pulls /launches and filters the returned launches in Python.
    Use this when the user asks about a specific agency, rocket, mission,
    launch name, payload, or program.
    """
    data = _safe_get("/launches", timeout=30)

    if data.get("error"):
        return data

    launches = data.get("launches", [])

    if not query:
        return {
            "message": "No search query provided.",
            "count": 0,
            "launches": [],
        }

    query_lower = query.lower()

    matching_launches = []
    for launch in launches:
        searchable_text = " ".join(
            str(launch.get(field, ""))
            for field in [
                "launchName",
                "programName",
                "status",
                "start",
                "end",
                "agency",
                "rocket",
                "mission",
            ]
        ).lower()

        if query_lower in searchable_text:
            matching_launches.append(launch)

    return {
        "message": f"Search results for '{query}'",
        "count": len(matching_launches),
        "launches": matching_launches,
    }
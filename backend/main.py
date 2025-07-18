from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import traceback
import os

# Import your question generator
from backend.gemini_client import gre_question

app = FastAPI(title="GRE Quiz API")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace * with specific domains
    allow_methods=["*"],
    allow_headers=["*"],
)

# GET endpoint to fetch a GRE quiz question by category
@app.get("/api/question")
async def api_question(request: Request):
    try:
        category = request.query_params.get("category", "verbal")
        result = await gre_question(category)
        return JSONResponse(content=result)
    except Exception as e:
        print("❌ ERROR in /api/question:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Get the absolute path to the frontend folder
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

if not os.path.exists(frontend_path):
    raise RuntimeError(f"❌ Frontend directory does not exist at: {frontend_path}")

# Serve static frontend files (index.html, app.js, styles.css)
print("✅ Serving frontend from:", frontend_path)
print("📂 Files in frontend:", os.listdir(frontend_path))

app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

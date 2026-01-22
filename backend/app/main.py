from dotenv import load_dotenv
import os
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import unified

app = FastAPI(
    title="Doc2SDK MVP API",
    description="AI-Powered API-to-SDK generator (Stateless)",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(unified.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Doc2SDK MVP API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

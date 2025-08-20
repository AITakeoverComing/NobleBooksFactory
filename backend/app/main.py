"""FastAPI main application with WebSocket support."""

import asyncio
from contextlib import asynccontextmanager
from typing import Dict, List

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from loguru import logger

from app.api import books, health, agents
from app.core.config import settings
from app.core.websocket_manager import WebSocketManager


# WebSocket manager for real-time updates
websocket_manager = WebSocketManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("🚀 Starting NobleBooksFactory Backend")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down NobleBooksFactory Backend")


# Create FastAPI app
app = FastAPI(
    title="NobleBooksFactory API",
    description="AI-powered book generation system with multi-agent architecture",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(books.router, prefix="/api/v1", tags=["books"])
app.include_router(agents.router, prefix="/api/v1", tags=["agents"])


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time updates."""
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            logger.debug(f"Received WebSocket message from {client_id}: {data}")
            
            # Echo back or handle specific commands
            await websocket_manager.send_personal_message(
                f"Echo: {data}", client_id
            )
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(client_id)
        logger.info(f"WebSocket client {client_id} disconnected")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "NobleBooksFactory API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "Contact admin for documentation",
        "websocket": "/ws/{client_id}",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/websocket-test")
async def websocket_test():
    """Test page for WebSocket functionality."""
    if not settings.DEBUG:
        return {"message": "WebSocket test page only available in debug mode"}
        
    html = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket Test</title>
        </head>
        <body>
            <h1>WebSocket Test</h1>
            <div id="messages"></div>
            <input type="text" id="messageInput" placeholder="Type a message..." />
            <button onclick="sendMessage()">Send</button>
            
            <script>
                const clientId = 'test_' + Math.random().toString(36).substr(2, 9);
                const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
                const messages = document.getElementById('messages');
                
                ws.onmessage = function(event) {
                    const message = document.createElement('div');
                    message.textContent = event.data;
                    messages.appendChild(message);
                };
                
                function sendMessage() {
                    const input = document.getElementById('messageInput');
                    ws.send(input.value);
                    input.value = '';
                }
                
                document.getElementById('messageInput').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
            </script>
        </body>
    </html>
    """
    return HTMLResponse(content=html)


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
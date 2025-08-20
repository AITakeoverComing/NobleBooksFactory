"""Health check endpoints."""

from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    timestamp: datetime
    version: str
    environment: str
    debug: bool


class DetailedHealthResponse(BaseModel):
    """Detailed health check response."""
    status: str
    timestamp: datetime
    version: str
    environment: str
    debug: bool
    services: Dict[str, Any]
    configuration: Dict[str, Any]


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG,
    )


@router.get("/health/detailed", response_model=DetailedHealthResponse)
async def detailed_health_check():
    """Detailed health check with service status."""
    
    # Check service configurations
    services = {
        "llm_providers": {
            "openai": bool(settings.OPENAI_API_KEY),
            "anthropic": bool(settings.ANTHROPIC_API_KEY),
            "huggingface": bool(settings.HUGGINGFACE_API_KEY),
            "cohere": bool(settings.COHERE_API_KEY),
        },
        "databases": {
            "postgresql": bool(settings.DATABASE_URL),
            "mongodb": bool(settings.MONGODB_URL),
            "redis": bool(settings.REDIS_URL),
        },
        "external_apis": {
            "serper": bool(settings.SERPER_API_KEY),
            "tavily": bool(settings.TAVILY_API_KEY),
            "reddit": bool(settings.REDDIT_CLIENT_ID and settings.REDDIT_CLIENT_SECRET),
        },
        "storage": {
            "type": settings.STORAGE_TYPE,
            "aws_configured": bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY),
        },
    }
    
    configuration = {
        "cors_origins": settings.ALLOWED_ORIGINS,
        "rate_limiting": {
            "requests_per_minute": settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
            "burst": settings.RATE_LIMIT_BURST,
        },
        "logging": {
            "level": settings.LOG_LEVEL,
            "format": settings.LOG_FORMAT,
        },
        "langchain": {
            "tracing": settings.LANGCHAIN_TRACING_V2,
            "project": settings.LANGCHAIN_PROJECT,
        },
    }
    
    return DetailedHealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG,
        services=services,
        configuration=configuration,
    )


@router.get("/health/ready")
async def readiness_check():
    """Kubernetes readiness probe endpoint."""
    # Add specific readiness checks here
    # For now, return simple success
    return {"status": "ready", "timestamp": datetime.utcnow()}


@router.get("/health/live")
async def liveness_check():
    """Kubernetes liveness probe endpoint."""
    # Add specific liveness checks here
    # For now, return simple success
    return {"status": "alive", "timestamp": datetime.utcnow()}
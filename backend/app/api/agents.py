"""Agent status and management endpoints."""

from typing import Dict, List, Optional
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.agent_coordinator import AgentCoordinator


class AgentStatus(BaseModel):
    """Agent status model."""
    name: str
    status: str  # idle, working, error
    current_task: Optional[str] = None
    tasks_completed: int = 0
    last_activity: Optional[datetime] = None
    error_message: Optional[str] = None


class AgentStatsResponse(BaseModel):
    """Agent statistics response."""
    agents: List[AgentStatus]
    system_status: str
    total_books_generated: int
    active_generations: int
    uptime: str


router = APIRouter()
agent_coordinator = AgentCoordinator()


@router.get("/agents/status", response_model=AgentStatsResponse)
async def get_agents_status():
    """Get status of all agents."""
    
    agent_statuses = await agent_coordinator.get_all_agent_statuses()
    system_stats = await agent_coordinator.get_system_stats()
    
    return AgentStatsResponse(
        agents=agent_statuses,
        system_status=system_stats["status"],
        total_books_generated=system_stats["total_books"],
        active_generations=system_stats["active_generations"],
        uptime=system_stats["uptime"],
    )


@router.get("/agents/{agent_name}/status", response_model=AgentStatus)
async def get_agent_status(agent_name: str):
    """Get status of a specific agent."""
    
    status = await agent_coordinator.get_agent_status(agent_name)
    if not status:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return status


@router.post("/agents/{agent_name}/reset")
async def reset_agent(agent_name: str):
    """Reset a specific agent."""
    
    success = await agent_coordinator.reset_agent(agent_name)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {"message": f"Agent {agent_name} reset successfully"}


@router.post("/agents/reset-all")
async def reset_all_agents():
    """Reset all agents."""
    
    result = await agent_coordinator.reset_all_agents()
    return {
        "message": "All agents reset",
        "reset_count": result["reset_count"],
    }


@router.get("/agents/health")
async def get_agents_health():
    """Get health status of the agent system."""
    
    health = await agent_coordinator.get_system_health()
    return health


@router.get("/agents/metrics")
async def get_agents_metrics():
    """Get detailed metrics for all agents."""
    
    metrics = await agent_coordinator.get_detailed_metrics()
    return metrics
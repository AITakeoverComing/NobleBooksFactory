"""Agent Coordinator - Manages and monitors all AI agents."""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

from loguru import logger

from app.models.agent import AgentStatus, AgentState
from app.agents.research_agent import ResearchAgent
from app.agents.content_agent import ContentGenerationAgent
from app.services.llm_service import llm_service


class AgentCoordinator:
    """Coordinates and monitors all AI agents in the system."""
    
    def __init__(self):
        self.agents: Dict[str, Any] = {}
        self.system_start_time = datetime.utcnow()
        self.total_books_generated = 0
        
        # Initialize agents
        self._initialize_agents()
        
        logger.info("🎯 Agent Coordinator initialized")
    
    def _initialize_agents(self):
        """Initialize all agents."""
        try:
            self.agents["research"] = ResearchAgent(llm_service, "research-agent")
            self.agents["content"] = ContentGenerationAgent(llm_service, "content-agent")
            
            logger.info(f"✅ Initialized {len(self.agents)} agents")
        
        except Exception as e:
            logger.error(f"❌ Failed to initialize agents: {e}")
            raise
    
    async def get_all_agent_statuses(self) -> List[AgentStatus]:
        """Get status of all agents."""
        statuses = []
        
        for agent_name, agent in self.agents.items():
            try:
                status = agent.get_status()
                statuses.append(status)
            except Exception as e:
                logger.error(f"Failed to get status for agent {agent_name}: {e}")
                # Create error status
                statuses.append(AgentStatus(
                    name=agent_name,
                    agent_type=getattr(agent, 'agent_type', 'unknown'),
                    state=AgentState.ERROR,
                    error_message=f"Status check failed: {str(e)}",
                    configuration=getattr(agent, 'config', None),
                ))
        
        return statuses
    
    async def get_agent_status(self, agent_name: str) -> Optional[AgentStatus]:
        """Get status of specific agent."""
        if agent_name in self.agents:
            try:
                return self.agents[agent_name].get_status()
            except Exception as e:
                logger.error(f"Failed to get status for agent {agent_name}: {e}")
                return None
        
        return None
    
    async def reset_agent(self, agent_name: str) -> bool:
        """Reset a specific agent."""
        if agent_name in self.agents:
            try:
                await self.agents[agent_name].reset()
                logger.info(f"🔄 Reset agent: {agent_name}")
                return True
            except Exception as e:
                logger.error(f"Failed to reset agent {agent_name}: {e}")
                return False
        
        return False
    
    async def reset_all_agents(self) -> Dict[str, Any]:
        """Reset all agents."""
        reset_count = 0
        
        for agent_name, agent in self.agents.items():
            try:
                await agent.reset()
                reset_count += 1
                logger.info(f"🔄 Reset agent: {agent_name}")
            except Exception as e:
                logger.error(f"Failed to reset agent {agent_name}: {e}")
        
        return {
            "reset_count": reset_count,
            "total_agents": len(self.agents),
        }
    
    async def get_system_stats(self) -> Dict[str, Any]:
        """Get overall system statistics."""
        
        # Count active generations (this would come from BookGenerationService in real implementation)
        active_generations = 0  # Placeholder
        
        # Calculate uptime
        uptime_seconds = (datetime.utcnow() - self.system_start_time).total_seconds()
        uptime_str = str(timedelta(seconds=int(uptime_seconds)))
        
        # Determine system status based on agent health
        healthy_agents = 0
        total_agents = len(self.agents)
        
        for agent in self.agents.values():
            try:
                status = agent.get_status()
                if status.state != AgentState.ERROR and status.health_score > 0.5:
                    healthy_agents += 1
            except:
                pass  # Agent is unhealthy
        
        if healthy_agents == total_agents:
            system_status = "healthy"
        elif healthy_agents > 0:
            system_status = "degraded"
        else:
            system_status = "critical"
        
        return {
            "status": system_status,
            "total_books": self.total_books_generated,
            "active_generations": active_generations,
            "uptime": uptime_str,
            "healthy_agents": healthy_agents,
            "total_agents": total_agents,
        }
    
    async def get_system_health(self) -> Dict[str, Any]:
        """Get detailed system health information."""
        
        agent_health = {}
        overall_healthy = True
        
        for agent_name, agent in self.agents.items():
            try:
                health = await agent.health_check()
                agent_health[agent_name] = health
                
                if health.get("status") != "healthy":
                    overall_healthy = False
            
            except Exception as e:
                agent_health[agent_name] = {
                    "status": "error",
                    "error": str(e),
                }
                overall_healthy = False
        
        return {
            "system_healthy": overall_healthy,
            "agents": agent_health,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    async def get_detailed_metrics(self) -> Dict[str, Any]:
        """Get detailed metrics for all agents."""
        
        metrics = {
            "system": {
                "uptime_seconds": (datetime.utcnow() - self.system_start_time).total_seconds(),
                "total_books_generated": self.total_books_generated,
                "agents_count": len(self.agents),
            },
            "agents": {}
        }
        
        for agent_name, agent in self.agents.items():
            try:
                status = agent.get_status()
                metrics["agents"][agent_name] = {
                    "state": status.state.value,
                    "health_score": status.health_score,
                    "tasks_completed": status.metrics.tasks_completed,
                    "tasks_failed": status.metrics.tasks_failed,
                    "success_rate": status.metrics.success_rate,
                    "average_task_duration": status.metrics.average_task_duration,
                    "last_activity": status.last_activity.isoformat() if status.last_activity else None,
                    "configuration": {
                        "llm_provider": status.configuration.llm_provider,
                        "model_name": status.configuration.model_name,
                        "temperature": status.configuration.temperature,
                        "max_tokens": status.configuration.max_tokens,
                    }
                }
            except Exception as e:
                metrics["agents"][agent_name] = {
                    "error": str(e),
                    "status": "unavailable"
                }
        
        return metrics
    
    def increment_books_generated(self):
        """Increment the total books generated counter."""
        self.total_books_generated += 1
        logger.info(f"📚 Total books generated: {self.total_books_generated}")
    
    def get_agent(self, agent_name: str) -> Optional[Any]:
        """Get agent instance by name."""
        return self.agents.get(agent_name)
    
    def get_all_agents(self) -> Dict[str, Any]:
        """Get all agent instances."""
        return self.agents.copy()
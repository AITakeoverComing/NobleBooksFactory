"""Base agent class for all AI agents."""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional, List
from uuid import uuid4

from loguru import logger

from app.models.agent import AgentStatus, AgentState, AgentType, AgentMetrics, AgentConfiguration
from app.services.llm_service import LLMService, LLMProvider


class BaseAgent(ABC):
    """Base class for all AI agents."""
    
    def __init__(
        self,
        name: str,
        agent_type: AgentType,
        llm_service: LLMService,
        config: Optional[AgentConfiguration] = None,
    ):
        self.name = name
        self.agent_type = agent_type
        self.llm_service = llm_service
        self.config = config or self._get_default_config()
        
        # Agent state
        self.state = AgentState.IDLE
        self.current_task: Optional[str] = None
        self.current_task_progress = 0
        self.last_activity: Optional[datetime] = None
        self.error_message: Optional[str] = None
        
        # Metrics
        self.metrics = AgentMetrics()
        self.start_time = datetime.utcnow()
        
        logger.info(f"🤖 Initialized {self.agent_type.value} agent: {self.name}")
    
    def _get_default_config(self) -> AgentConfiguration:
        """Get default configuration for this agent type."""
        return AgentConfiguration(
            name=self.name,
            agent_type=self.agent_type,
            llm_provider="openai",
            model_name="gpt-4-turbo-preview",
            temperature=0.7,
            max_tokens=4000,
            timeout=300,
            max_concurrent_tasks=1,
        )
    
    @abstractmethod
    async def process_task(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        """Process a task and return results."""
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Get list of capabilities this agent supports."""
        pass
    
    async def execute_task(self, task_id: str, task_input: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task with error handling and metrics tracking."""
        
        task_start_time = datetime.utcnow()
        self.state = AgentState.WORKING
        self.current_task = task_id
        self.current_task_progress = 0
        self.last_activity = task_start_time
        self.error_message = None
        
        try:
            logger.info(f"🚀 {self.name} starting task: {task_id}")
            
            # Process the task
            result = await self.process_task(task_input)
            
            # Update metrics on success
            task_duration = (datetime.utcnow() - task_start_time).total_seconds()
            self.metrics.tasks_completed += 1
            self.metrics.last_task_completed = datetime.utcnow()
            
            # Update average duration
            if self.metrics.average_task_duration is None:
                self.metrics.average_task_duration = task_duration
            else:
                total_tasks = self.metrics.tasks_completed + self.metrics.tasks_failed
                self.metrics.average_task_duration = (
                    (self.metrics.average_task_duration * (total_tasks - 1) + task_duration) / total_tasks
                )
            
            # Update success rate
            total_tasks = self.metrics.tasks_completed + self.metrics.tasks_failed
            self.metrics.success_rate = self.metrics.tasks_completed / total_tasks
            
            self.state = AgentState.IDLE
            self.current_task = None
            self.current_task_progress = 100
            
            logger.info(f"✅ {self.name} completed task: {task_id} in {task_duration:.2f}s")
            
            return {
                "success": True,
                "result": result,
                "duration": task_duration,
                "agent": self.name,
                "completed_at": datetime.utcnow().isoformat(),
            }
        
        except Exception as e:
            # Update metrics on failure
            self.metrics.tasks_failed += 1
            total_tasks = self.metrics.tasks_completed + self.metrics.tasks_failed
            self.metrics.success_rate = self.metrics.tasks_completed / total_tasks if total_tasks > 0 else 0
            
            self.state = AgentState.ERROR
            self.error_message = str(e)
            
            logger.error(f"❌ {self.name} failed task: {task_id} - {e}")
            
            return {
                "success": False,
                "error": str(e),
                "agent": self.name,
                "failed_at": datetime.utcnow().isoformat(),
            }
    
    async def generate_llm_completion(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Generate LLM completion using configured provider."""
        
        return await self.llm_service.generate_completion(
            prompt=prompt,
            system_message=system_message,
            preferred_provider=LLMProvider(self.config.llm_provider),
            temperature=temperature or self.config.temperature,
            max_tokens=max_tokens or self.config.max_tokens,
        )
    
    def update_progress(self, progress: int, message: Optional[str] = None):
        """Update task progress."""
        self.current_task_progress = max(0, min(100, progress))
        self.last_activity = datetime.utcnow()
        
        if message:
            logger.info(f"📊 {self.name} progress: {progress}% - {message}")
    
    def get_status(self) -> AgentStatus:
        """Get current agent status."""
        
        # Calculate uptime
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        self.metrics.total_uptime = uptime
        
        # Calculate health score based on success rate and recent activity
        health_score = self.metrics.success_rate
        if self.state == AgentState.ERROR:
            health_score *= 0.5
        if self.last_activity and (datetime.utcnow() - self.last_activity).total_seconds() > 3600:
            health_score *= 0.8  # Penalize for inactivity
        
        return AgentStatus(
            name=self.name,
            agent_type=self.agent_type,
            state=self.state,
            current_task=self.current_task,
            current_task_progress=self.current_task_progress,
            last_activity=self.last_activity,
            error_message=self.error_message,
            metrics=self.metrics,
            configuration=self.config,
            health_score=health_score,
        )
    
    async def reset(self):
        """Reset agent to initial state."""
        self.state = AgentState.IDLE
        self.current_task = None
        self.current_task_progress = 0
        self.error_message = None
        self.last_activity = datetime.utcnow()
        
        logger.info(f"🔄 Reset agent: {self.name}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform agent health check."""
        try:
            # Test LLM connectivity
            test_result = await self.generate_llm_completion(
                prompt="Test connection",
                system_message="You are a test agent. Respond with 'OK'.",
                max_tokens=10,
            )
            
            return {
                "status": "healthy",
                "llm_provider": test_result.get("provider"),
                "model": test_result.get("model"),
                "response_time": "fast",
                "last_check": datetime.utcnow().isoformat(),
            }
        
        except Exception as e:
            self.state = AgentState.ERROR
            self.error_message = f"Health check failed: {str(e)}"
            
            return {
                "status": "unhealthy",
                "error": str(e),
                "last_check": datetime.utcnow().isoformat(),
            }
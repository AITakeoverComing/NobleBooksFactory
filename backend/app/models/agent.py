"""Agent-related Pydantic models."""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any

from pydantic import BaseModel, Field


class AgentType(str, Enum):
    """Agent type enum."""
    RESEARCH = "research"
    CONTENT_GENERATION = "content_generation"
    EDITORIAL = "editorial"
    COORDINATOR = "coordinator"


class AgentState(str, Enum):
    """Agent state enum."""
    IDLE = "idle"
    WORKING = "working"
    ERROR = "error"
    MAINTENANCE = "maintenance"


class TaskStatus(str, Enum):
    """Task status enum."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentTask(BaseModel):
    """Agent task model."""
    id: str
    agent_type: AgentType
    task_type: str
    description: str
    input_data: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3


class AgentCapability(BaseModel):
    """Agent capability model."""
    name: str
    description: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    estimated_duration: Optional[int] = None  # in seconds


class AgentMetrics(BaseModel):
    """Agent performance metrics."""
    tasks_completed: int = 0
    tasks_failed: int = 0
    average_task_duration: Optional[float] = None  # in seconds
    success_rate: float = 0.0
    last_task_completed: Optional[datetime] = None
    total_uptime: Optional[float] = None  # in seconds


class AgentConfiguration(BaseModel):
    """Agent configuration model."""
    name: str
    agent_type: AgentType
    llm_provider: str = "openai"
    model_name: str = "gpt-4-turbo-preview"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=4000, ge=100, le=32000)
    timeout: int = Field(default=300, ge=30, le=1800)  # in seconds
    max_concurrent_tasks: int = Field(default=1, ge=1, le=10)
    capabilities: List[AgentCapability] = []
    custom_config: Dict[str, Any] = {}


class AgentStatus(BaseModel):
    """Agent status model."""
    name: str
    agent_type: AgentType
    state: AgentState
    current_task: Optional[str] = None
    current_task_progress: int = Field(default=0, ge=0, le=100)
    last_activity: Optional[datetime] = None
    error_message: Optional[str] = None
    metrics: AgentMetrics = AgentMetrics()
    configuration: AgentConfiguration
    health_score: float = Field(default=1.0, ge=0.0, le=1.0)


class WorkflowState(BaseModel):
    """LangGraph workflow state model."""
    book_id: str
    current_step: str
    completed_steps: List[str] = []
    failed_steps: List[str] = []
    research_data: Optional[Dict[str, Any]] = None
    outline_data: Optional[Dict[str, Any]] = None
    content_data: Optional[Dict[str, Any]] = None
    review_data: Optional[Dict[str, Any]] = None
    errors: List[str] = []
    metadata: Dict[str, Any] = {}
    started_at: datetime
    updated_at: datetime
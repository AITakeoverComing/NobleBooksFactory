"""Book Generation Service - Orchestrates the complete book generation workflow."""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from uuid import uuid4
import asyncio

from loguru import logger

from app.models.book import BookGenerationRequest, BookGenerationResponse, BookStatus
from app.agents.research_agent import ResearchAgent
from app.agents.content_agent import ContentGenerationAgent
from app.services.llm_service import llm_service


class BookGenerationService:
    """Service that orchestrates the complete book generation workflow."""
    
    def __init__(self):
        # In-memory storage for demo (in production, use database)
        self.active_generations: Dict[str, Dict[str, Any]] = {}
        self.completed_books: Dict[str, Dict[str, Any]] = {}
        
        # Initialize agents
        self.research_agent = ResearchAgent(llm_service)
        self.content_agent = ContentGenerationAgent(llm_service)
        
        logger.info("📚 Book Generation Service initialized")
    
    async def generate_book_async(self, request: BookGenerationRequest):
        """Generate book asynchronously with progress tracking."""
        
        book_id = request.id
        logger.info(f"🚀 Starting book generation: {book_id} - {request.topic}")
        
        # Initialize progress tracking
        self.active_generations[book_id] = {
            "request": request,
            "status": BookStatus.PENDING,
            "progress": 0,
            "current_stage": "initializing",
            "started_at": datetime.utcnow(),
            "estimated_completion": datetime.utcnow() + timedelta(minutes=15),
            "stages_completed": [],
            "errors": [],
        }
        
        try:
            # Update status to researching
            await self._update_book_status(book_id, BookStatus.RESEARCHING, 5, "Starting research phase")
            
            # Stage 1: Research
            research_result = await self.research_agent.execute_task(
                task_id=f"{book_id}-research",
                task_input={
                    "task_type": "comprehensive_research",
                    "topic": request.topic,
                    "depth": "medium",
                }
            )
            
            if not research_result["success"]:
                raise Exception(f"Research failed: {research_result.get('error', 'Unknown error')}")
            
            await self._update_book_status(book_id, BookStatus.GENERATING_OUTLINE, 30, "Research completed, generating outline")
            
            # Stage 2: Content Generation
            content_result = await self.content_agent.execute_task(
                task_id=f"{book_id}-content",
                task_input={
                    "task_type": "full_book_generation",
                    "research_data": research_result["result"]["research_data"],
                    "book_config": {
                        "topic": request.topic,
                        "target_audience": request.target_audience.value,
                        "writing_style": request.writing_style.value,
                        "book_length": request.book_length.value,
                        "chapter_count": request.chapter_count,
                        "include_examples": request.include_examples,
                        "include_exercises": request.include_exercises,
                    }
                }
            )
            
            if not content_result["success"]:
                raise Exception(f"Content generation failed: {content_result.get('error', 'Unknown error')}")
            
            await self._update_book_status(book_id, BookStatus.REVIEWING, 85, "Content generated, reviewing quality")
            
            # Stage 3: Quality Review (simplified for now)
            quality_score = await self._perform_quality_review(content_result["result"])
            
            await self._update_book_status(book_id, BookStatus.COMPLETED, 100, "Book generation completed")
            
            # Move to completed books
            book_data = {
                "request": request,
                "research_data": research_result["result"]["research_data"],
                "book_content": content_result["result"]["book_content"],
                "outline": content_result["result"]["outline"],
                "quality_score": quality_score,
                "completed_at": datetime.utcnow(),
                "generation_time": (datetime.utcnow() - self.active_generations[book_id]["started_at"]).total_seconds(),
            }
            
            self.completed_books[book_id] = book_data
            
            if book_id in self.active_generations:
                del self.active_generations[book_id]
            
            logger.info(f"✅ Book generation completed: {book_id}")
            
        except Exception as e:
            logger.error(f"❌ Book generation failed: {book_id} - {e}")
            await self._update_book_status(book_id, BookStatus.FAILED, None, f"Generation failed: {str(e)}")
            
            if book_id in self.active_generations:
                self.active_generations[book_id]["error"] = str(e)
    
    async def _update_book_status(self, book_id: str, status: BookStatus, progress: Optional[int], message: str):
        """Update book generation status and progress."""
        
        if book_id in self.active_generations:
            self.active_generations[book_id].update({
                "status": status,
                "current_stage": message,
                "updated_at": datetime.utcnow(),
            })
            
            if progress is not None:
                self.active_generations[book_id]["progress"] = progress
            
            logger.info(f"📊 {book_id}: {status.value} - {progress}% - {message}")
            
            # TODO: Send WebSocket update to connected clients
            # await websocket_manager.send_json_to_room({
            #     "type": "book_progress",
            #     "book_id": book_id,
            #     "status": status.value,
            #     "progress": progress,
            #     "message": message,
            # }, f"book_{book_id}")
    
    async def _perform_quality_review(self, content_result: Dict[str, Any]) -> float:
        """Perform basic quality review (simplified)."""
        
        book_content = content_result.get("book_content", {})
        word_count = book_content.get("word_count", 0)
        chapter_count = len(book_content.get("chapters", []))
        
        # Simple quality scoring
        quality_score = 0.7  # Base score
        
        # Bonus for adequate word count
        if word_count >= 15000:  # Good book length
            quality_score += 0.15
        elif word_count >= 8000:  # Minimum book length
            quality_score += 0.1
        
        # Bonus for proper chapter structure
        if 5 <= chapter_count <= 12:  # Good chapter count
            quality_score += 0.1
        
        # Bonus for having all sections
        if all(book_content.get(section) for section in ["introduction", "chapters", "conclusion"]):
            quality_score += 0.05
        
        return min(1.0, quality_score)
    
    async def get_book(self, book_id: str) -> Optional[BookGenerationResponse]:
        """Get book status and information."""
        
        # Check active generations
        if book_id in self.active_generations:
            gen_data = self.active_generations[book_id]
            request = gen_data["request"]
            
            return BookGenerationResponse(
                id=book_id,
                topic=request.topic,
                status=gen_data["status"],
                progress=gen_data["progress"],
                created_at=request.created_at,
                started_at=gen_data["started_at"],
                completed_at=None,
                estimated_completion=gen_data.get("estimated_completion"),
                message=gen_data.get("current_stage", "Processing"),
                error_message=gen_data.get("error"),
            )
        
        # Check completed books
        if book_id in self.completed_books:
            book_data = self.completed_books[book_id]
            request = book_data["request"]
            
            return BookGenerationResponse(
                id=book_id,
                topic=request.topic,
                status=BookStatus.COMPLETED,
                progress=100,
                created_at=request.created_at,
                started_at=book_data.get("started_at"),
                completed_at=book_data["completed_at"],
                message="Book generation completed successfully",
            )
        
        return None
    
    async def list_books(
        self, 
        page: int = 1, 
        page_size: int = 20, 
        status_filter: Optional[BookStatus] = None
    ) -> Dict[str, Any]:
        """List books with pagination and filtering."""
        
        all_books = []
        
        # Add active generations
        for book_id, gen_data in self.active_generations.items():
            request = gen_data["request"]
            book_response = BookGenerationResponse(
                id=book_id,
                topic=request.topic,
                status=gen_data["status"],
                progress=gen_data["progress"],
                created_at=request.created_at,
                started_at=gen_data["started_at"],
                message=gen_data.get("current_stage", "Processing"),
            )
            
            if status_filter is None or book_response.status == status_filter:
                all_books.append(book_response)
        
        # Add completed books
        for book_id, book_data in self.completed_books.items():
            request = book_data["request"]
            book_response = BookGenerationResponse(
                id=book_id,
                topic=request.topic,
                status=BookStatus.COMPLETED,
                progress=100,
                created_at=request.created_at,
                completed_at=book_data["completed_at"],
                message="Completed",
            )
            
            if status_filter is None or book_response.status == status_filter:
                all_books.append(book_response)
        
        # Sort by creation date (newest first)
        all_books.sort(key=lambda x: x.created_at, reverse=True)
        
        # Pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_books = all_books[start_idx:end_idx]
        
        return {
            "books": paginated_books,
            "total": len(all_books),
            "page": page,
            "page_size": page_size,
        }
    
    async def delete_book(self, book_id: str) -> bool:
        """Delete a book."""
        
        if book_id in self.active_generations:
            del self.active_generations[book_id]
            return True
        
        if book_id in self.completed_books:
            del self.completed_books[book_id]
            return True
        
        return False
    
    async def cancel_generation(self, book_id: str) -> bool:
        """Cancel ongoing book generation."""
        
        if book_id in self.active_generations:
            self.active_generations[book_id]["status"] = BookStatus.CANCELLED
            self.active_generations[book_id]["message"] = "Generation cancelled by user"
            logger.info(f"🛑 Book generation cancelled: {book_id}")
            return True
        
        return False
    
    async def get_book_content(self, book_id: str) -> Optional[Dict[str, Any]]:
        """Get full book content."""
        
        if book_id in self.completed_books:
            return self.completed_books[book_id]["book_content"]
        
        return None
    
    async def get_detailed_progress(self, book_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed progress information."""
        
        if book_id in self.active_generations:
            gen_data = self.active_generations[book_id]
            return {
                "book_id": book_id,
                "status": gen_data["status"].value,
                "progress": gen_data["progress"],
                "current_stage": gen_data.get("current_stage", "Processing"),
                "started_at": gen_data["started_at"].isoformat(),
                "estimated_completion": gen_data.get("estimated_completion").isoformat() if gen_data.get("estimated_completion") else None,
                "stages_completed": gen_data.get("stages_completed", []),
                "errors": gen_data.get("errors", []),
                "agents_status": {
                    "research_agent": self.research_agent.get_status().dict(),
                    "content_agent": self.content_agent.get_status().dict(),
                }
            }
        
        if book_id in self.completed_books:
            book_data = self.completed_books[book_id]
            return {
                "book_id": book_id,
                "status": "completed",
                "progress": 100,
                "completed_at": book_data["completed_at"].isoformat(),
                "generation_time": book_data.get("generation_time", 0),
                "quality_score": book_data.get("quality_score", 0),
                "word_count": book_data["book_content"].get("word_count", 0),
                "chapter_count": len(book_data["book_content"].get("chapters", [])),
            }
        
        return None
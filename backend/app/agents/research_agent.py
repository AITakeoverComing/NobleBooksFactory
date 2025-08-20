"""Research Agent - Conducts comprehensive research on topics."""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import httpx

from loguru import logger

from app.agents.base_agent import BaseAgent
from app.models.agent import AgentType
from app.models.book import ResearchData
from app.core.config import settings


class ResearchAgent(BaseAgent):
    """Agent specialized in research and information gathering."""
    
    def __init__(self, llm_service, name: str = "research-agent"):
        super().__init__(
            name=name,
            agent_type=AgentType.RESEARCH,
            llm_service=llm_service,
        )
        
        # Configure for research tasks
        self.config.temperature = 0.3  # Lower temperature for factual accuracy
        self.config.max_tokens = 6000
        
        self.research_sources = {
            "web_search": bool(settings.SERPER_API_KEY or settings.TAVILY_API_KEY),
            "academic": False,  # Would need academic database access
            "social": bool(settings.REDDIT_CLIENT_ID),
            "trends": bool(settings.GOOGLE_API_KEY),
        }
        
        logger.info(f"🔍 Research capabilities: {self.research_sources}")
    
    def get_capabilities(self) -> List[str]:
        """Get research agent capabilities."""
        return [
            "topic_analysis",
            "web_research", 
            "source_compilation",
            "fact_extraction",
            "trend_analysis",
            "credibility_assessment",
        ]
    
    async def process_task(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        """Process research task."""
        
        task_type = task_input.get("task_type", "comprehensive_research")
        topic = task_input.get("topic", "")
        depth = task_input.get("depth", "medium")  # shallow, medium, deep
        
        if not topic:
            raise ValueError("Topic is required for research")
        
        self.update_progress(5, "Starting research analysis")
        
        # Step 1: Topic analysis and research planning
        research_plan = await self._analyze_topic_and_plan_research(topic)
        self.update_progress(20, "Research plan created")
        
        # Step 2: Conduct web research
        web_results = await self._conduct_web_research(topic, research_plan)
        self.update_progress(50, "Web research completed")
        
        # Step 3: Extract and organize findings
        organized_findings = await self._organize_findings(topic, web_results, research_plan)
        self.update_progress(75, "Findings organized")
        
        # Step 4: Create final research data
        research_data = await self._create_research_summary(topic, organized_findings)
        self.update_progress(100, "Research completed")
        
        return {
            "research_data": research_data,
            "sources_count": len(research_data.get("sources", [])),
            "key_findings_count": len(research_data.get("key_findings", [])),
            "research_quality_score": research_data.get("quality_score", 0.8),
        }
    
    async def _analyze_topic_and_plan_research(self, topic: str) -> Dict[str, Any]:
        """Analyze topic and create research plan."""
        
        system_message = """You are a professional researcher. Create a comprehensive research plan for the given topic.
        
        Your research plan should include:
        1. Key research questions to answer
        2. Important subtopics to explore
        3. Types of sources to prioritize
        4. Potential challenges or considerations
        5. Success criteria for comprehensive coverage
        
        Be thorough and specific."""
        
        prompt = f"""Create a detailed research plan for the topic: "{topic}"
        
        The research will be used to write a comprehensive non-fiction book on this subject.
        Consider what readers would want to know about this topic and what information would be most valuable.
        
        Format your response as a structured plan with clear sections."""
        
        result = await self.generate_llm_completion(
            prompt=prompt,
            system_message=system_message,
        )
        
        # Parse the research plan
        plan_text = result["content"]
        
        return {
            "plan_text": plan_text,
            "research_questions": self._extract_research_questions(plan_text),
            "subtopics": self._extract_subtopics(plan_text),
            "source_priorities": ["recent articles", "expert opinions", "statistical data", "case studies"],
        }
    
    async def _conduct_web_research(self, topic: str, research_plan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Conduct web research using available APIs."""
        
        web_results = []
        
        # Use available web research APIs
        if settings.SERPER_API_KEY:
            serper_results = await self._search_with_serper(topic, research_plan["research_questions"][:3])
            web_results.extend(serper_results)
        
        elif settings.TAVILY_API_KEY:
            tavily_results = await self._search_with_tavily(topic, research_plan["research_questions"][:3])
            web_results.extend(tavily_results)
        
        else:
            # Fallback to LLM-based research simulation
            logger.warning("No web search API available, using LLM-based research simulation")
            simulated_results = await self._simulate_web_research(topic, research_plan)
            web_results.extend(simulated_results)
        
        return web_results
    
    async def _search_with_serper(self, topic: str, questions: List[str]) -> List[Dict[str, Any]]:
        """Search using Serper API."""
        results = []
        
        try:
            async with httpx.AsyncClient() as client:
                for question in questions:
                    query = f"{topic} {question}"
                    
                    response = await client.post(
                        "https://google.serper.dev/search",
                        headers={
                            "X-API-KEY": settings.SERPER_API_KEY,
                            "Content-Type": "application/json"
                        },
                        json={"q": query, "num": 5},
                        timeout=10,
                    )
                    
                    if response.status_code == 200:
                        search_data = response.json()
                        for result in search_data.get("organic", []):
                            results.append({
                                "title": result.get("title", ""),
                                "url": result.get("link", ""),
                                "snippet": result.get("snippet", ""),
                                "source": "serper",
                                "relevance_score": 0.8,
                            })
                    
                    await asyncio.sleep(0.5)  # Rate limiting
        
        except Exception as e:
            logger.error(f"Serper search failed: {e}")
        
        return results[:15]  # Limit results
    
    async def _search_with_tavily(self, topic: str, questions: List[str]) -> List[Dict[str, Any]]:
        """Search using Tavily API."""
        results = []
        
        try:
            async with httpx.AsyncClient() as client:
                for question in questions:
                    query = f"{topic} {question}"
                    
                    response = await client.post(
                        "https://api.tavily.com/search",
                        headers={
                            "Content-Type": "application/json"
                        },
                        json={
                            "api_key": settings.TAVILY_API_KEY,
                            "query": query,
                            "search_depth": "advanced",
                            "max_results": 5,
                        },
                        timeout=10,
                    )
                    
                    if response.status_code == 200:
                        search_data = response.json()
                        for result in search_data.get("results", []):
                            results.append({
                                "title": result.get("title", ""),
                                "url": result.get("url", ""),
                                "snippet": result.get("content", "")[:200] + "...",
                                "source": "tavily",
                                "relevance_score": result.get("score", 0.7),
                            })
                    
                    await asyncio.sleep(0.5)  # Rate limiting
        
        except Exception as e:
            logger.error(f"Tavily search failed: {e}")
        
        return results[:15]  # Limit results
    
    async def _simulate_web_research(self, topic: str, research_plan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Simulate web research using LLM when no APIs are available."""
        
        system_message = """You are a research assistant simulating web research results.
        Create realistic, factual information about the given topic as if you found it through web research.
        Include diverse perspectives and current information."""
        
        prompt = f"""Simulate finding 5-8 high-quality web sources about: "{topic}"
        
        Research questions to address:
        {chr(10).join(f'- {q}' for q in research_plan.get('research_questions', [])[:5])}
        
        For each simulated source, provide:
        - Title
        - Brief description/snippet (100-150 words)
        - Key insights or data points
        - Type of source (news article, research paper, expert blog, etc.)
        
        Make the information realistic and helpful for book writing."""
        
        result = await self.generate_llm_completion(
            prompt=prompt,
            system_message=system_message,
            max_tokens=3000,
        )
        
        # Parse simulated results
        return self._parse_simulated_research(result["content"])
    
    def _extract_research_questions(self, plan_text: str) -> List[str]:
        """Extract research questions from plan text."""
        lines = plan_text.split('\n')
        questions = []
        
        for line in lines:
            if '?' in line and any(word in line.lower() for word in ['what', 'how', 'why', 'when', 'where', 'who']):
                questions.append(line.strip('- ').strip())
        
        return questions[:8]  # Limit questions
    
    def _extract_subtopics(self, plan_text: str) -> List[str]:
        """Extract subtopics from plan text."""
        lines = plan_text.split('\n')
        subtopics = []
        
        for line in lines:
            if (line.strip().startswith('-') or line.strip().startswith('•')) and len(line) > 20:
                subtopic = line.strip('- •').strip()
                if '?' not in subtopic:  # Exclude questions
                    subtopics.append(subtopic)
        
        return subtopics[:10]  # Limit subtopics
    
    def _parse_simulated_research(self, content: str) -> List[Dict[str, Any]]:
        """Parse simulated research results."""
        results = []
        sections = content.split('\n\n')
        
        for i, section in enumerate(sections):
            if len(section) > 50:  # Filter meaningful sections
                results.append({
                    "title": f"Research Source {i+1}",
                    "url": f"https://example-source-{i+1}.com",
                    "snippet": section[:200] + "...",
                    "source": "llm_simulation",
                    "relevance_score": 0.7,
                })
        
        return results
    
    async def _organize_findings(self, topic: str, web_results: List[Dict[str, Any]], research_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Organize and synthesize research findings."""
        
        # Combine all research content
        all_content = "\n\n".join([
            f"Title: {result['title']}\nContent: {result['snippet']}"
            for result in web_results
        ])
        
        system_message = """You are a research analyst. Organize and synthesize research findings into clear, actionable insights.
        Focus on accuracy, relevance, and usefulness for book writing."""
        
        prompt = f"""Analyze and organize these research findings about "{topic}":

{all_content[:4000]}  # Limit content to avoid token limits

Create an organized summary with:
1. Key Findings (5-8 main insights)
2. Important Statistics or Data Points
3. Expert Perspectives or Quotes
4. Current Trends
5. Areas Needing More Research

Be factual and cite insights appropriately."""
        
        result = await self.generate_llm_completion(
            prompt=prompt,
            system_message=system_message,
            max_tokens=2000,
        )
        
        return {
            "organized_content": result["content"],
            "source_count": len(web_results),
            "research_depth": "comprehensive" if len(web_results) >= 10 else "moderate",
        }
    
    async def _create_research_summary(self, topic: str, organized_findings: Dict[str, Any]) -> Dict[str, Any]:
        """Create final research summary."""
        
        research_summary = {
            "topic": topic,
            "sources": [],  # Would contain actual sources
            "key_findings": self._extract_key_findings(organized_findings["organized_content"]),
            "statistics": self._extract_statistics(organized_findings["organized_content"]),
            "expert_quotes": self._extract_quotes(organized_findings["organized_content"]),
            "trends": self._extract_trends(organized_findings["organized_content"]),
            "research_completed_at": datetime.utcnow(),
            "quality_score": self._calculate_quality_score(organized_findings),
        }
        
        return research_summary
    
    def _extract_key_findings(self, content: str) -> List[str]:
        """Extract key findings from organized content."""
        lines = content.split('\n')
        findings = []
        
        in_findings_section = False
        for line in lines:
            if 'key finding' in line.lower():
                in_findings_section = True
                continue
            elif any(header in line.lower() for header in ['statistics', 'expert', 'trends', 'research']):
                in_findings_section = False
            elif in_findings_section and line.strip().startswith('-'):
                findings.append(line.strip('- ').strip())
        
        return findings[:8]
    
    def _extract_statistics(self, content: str) -> List[Dict[str, str]]:
        """Extract statistics from content."""
        stats = []
        lines = content.split('\n')
        
        for line in lines:
            if any(indicator in line for indicator in ['%', 'percent', 'billion', 'million', 'increase', 'decrease']):
                stats.append({
                    "stat": line.strip('- ').strip(),
                    "source": "research"
                })
        
        return stats[:5]
    
    def _extract_quotes(self, content: str) -> List[Dict[str, str]]:
        """Extract expert quotes from content."""
        quotes = []
        lines = content.split('\n')
        
        for line in lines:
            if '"' in line or 'expert' in line.lower():
                quotes.append({
                    "quote": line.strip('- ').strip(),
                    "source": "expert"
                })
        
        return quotes[:3]
    
    def _extract_trends(self, content: str) -> List[str]:
        """Extract trends from content."""
        trends = []
        lines = content.split('\n')
        
        in_trends_section = False
        for line in lines:
            if 'trend' in line.lower():
                in_trends_section = True
                continue
            elif any(header in line.lower() for header in ['finding', 'statistics', 'expert', 'research']):
                in_trends_section = False
            elif in_trends_section and line.strip().startswith('-'):
                trends.append(line.strip('- ').strip())
        
        return trends[:5]
    
    def _calculate_quality_score(self, organized_findings: Dict[str, Any]) -> float:
        """Calculate research quality score."""
        base_score = 0.6
        
        # Bonus for number of sources
        if organized_findings.get("source_count", 0) >= 10:
            base_score += 0.2
        elif organized_findings.get("source_count", 0) >= 5:
            base_score += 0.1
        
        # Bonus for research depth
        if organized_findings.get("research_depth") == "comprehensive":
            base_score += 0.1
        
        return min(1.0, base_score)
import { LLMClient } from '../../services/llm-client.js';
import logger from '../../utils/logger.js';
import axios from 'axios';

/**
 * Research Agent
 * Gathers comprehensive information about topics from multiple sources
 */

export class ResearchAgent {
  constructor() {
    this.llmClient = new LLMClient('research');
    this.sources = [];
    this.researchData = {};
  }

  /**
   * Main research method - orchestrates the research process
   */
  async conductResearch(topic, options = {}) {
    const {
      depth = 'comprehensive', // basic, detailed, comprehensive
      includeSources = true,
      maxSources = 20,
      categories = ['academic', 'news', 'social', 'market'],
      timeframe = '1y'
    } = options;

    logger.info(`Starting research on topic: ${topic}`);

    try {
      // Step 1: Generate research questions and subtopics
      const researchPlan = await this.generateResearchPlan(topic, depth);
      
      // Step 2: Gather information from multiple sources
      const rawData = await this.gatherInformation(topic, researchPlan, {
        maxSources,
        categories,
        timeframe
      });

      // Step 3: Analyze and synthesize findings
      const analysis = await this.analyzeFindings(topic, rawData, researchPlan);

      // Step 4: Generate structured research report
      const report = await this.generateResearchReport(topic, analysis, researchPlan);

      return {
        topic,
        researchPlan,
        analysis,
        report,
        sources: includeSources ? this.sources : [],
        metadata: {
          depth,
          sourceCount: this.sources.length,
          completedAt: new Date().toISOString(),
          agent: 'ResearchAgent'
        }
      };

    } catch (error) {
      logger.error(`Research failed for topic ${topic}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate research plan with questions and subtopics
   */
  async generateResearchPlan(topic, depth) {
    const systemMessage = `You are a research planning expert. Create a comprehensive research plan for the given topic.

For ${depth} research, generate:
1. Key research questions (3-5 main questions)
2. Subtopics to explore (5-10 subtopics)
3. Information types needed (statistics, expert opinions, case studies, etc.)
4. Potential sources to investigate

Format your response as JSON with: questions, subtopics, informationTypes, suggestedSources`;

    const prompt = `Create a ${depth} research plan for the topic: "${topic}"

Consider current trends, market relevance, and practical applications. Focus on information that would be valuable for creating a non-fiction book on this subject.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.3 // Lower temperature for more structured output
    });

    try {
      const plan = JSON.parse(response.content);
      logger.info(`Generated research plan with ${plan.questions?.length || 0} questions`);
      return plan;
    } catch (parseError) {
      // Fallback if JSON parsing fails
      logger.warn('Failed to parse research plan JSON, using structured text');
      return {
        questions: this.extractResearchQuestions(response.content),
        subtopics: this.extractSubtopics(response.content),
        informationTypes: ['expert opinions', 'statistics', 'case studies', 'recent developments'],
        suggestedSources: ['academic papers', 'industry reports', 'news articles', 'expert interviews']
      };
    }
  }

  /**
   * Gather information from multiple sources
   */
  async gatherInformation(topic, researchPlan, options) {
    const gatheredData = {
      academic: [],
      news: [],
      social: [],
      market: [],
      expert: []
    };

    // Simulate gathering from different source types
    // In a real implementation, this would connect to various APIs

    // Academic sources (simulated)
    if (options.categories.includes('academic')) {
      gatheredData.academic = await this.gatherAcademicSources(topic, researchPlan);
    }

    // News sources (simulated)
    if (options.categories.includes('news')) {
      gatheredData.news = await this.gatherNewsSources(topic, options.timeframe);
    }

    // Social media insights (simulated)
    if (options.categories.includes('social')) {
      gatheredData.social = await this.gatherSocialInsights(topic);
    }

    // Market data (simulated)
    if (options.categories.includes('market')) {
      gatheredData.market = await this.gatherMarketData(topic);
    }

    return gatheredData;
  }

  /**
   * Analyze gathered findings using LLM
   */
  async analyzeFindings(topic, rawData, researchPlan) {
    const systemMessage = `You are a research analyst. Analyze the gathered information and provide insights.

Create a structured analysis including:
1. Key findings and insights
2. Trends and patterns
3. Conflicting information (if any)
4. Data quality assessment
5. Knowledge gaps
6. Actionable conclusions`;

    const dataString = JSON.stringify(rawData, null, 2);
    const questionsString = researchPlan.questions?.join('\n') || '';

    const prompt = `Analyze the following research data for the topic: "${topic}"

Research Questions:
${questionsString}

Gathered Data:
${dataString}

Provide a comprehensive analysis with key insights, trends, and conclusions that would be valuable for creating authoritative content on this topic.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.4,
      maxTokens: 6000
    });

    return {
      content: response.content,
      keyFindings: this.extractKeyFindings(response.content),
      trends: this.extractTrends(response.content),
      credibilityScore: this.assessCredibility(rawData)
    };
  }

  /**
   * Generate final structured research report
   */
  async generateResearchReport(topic, analysis, researchPlan) {
    const systemMessage = `You are a research report writer. Create a comprehensive, well-structured research report.

The report should include:
1. Executive Summary
2. Key Findings
3. Detailed Analysis by Topic
4. Trends and Insights
5. Practical Applications
6. Recommendations
7. Areas for Further Research

Write in a professional, authoritative tone suitable for a non-fiction book foundation.`;

    const prompt = `Create a comprehensive research report for: "${topic}"

Research Questions Addressed:
${researchPlan.questions?.join('\n') || ''}

Analysis Results:
${analysis.content}

Generate a detailed, well-structured report that serves as a solid foundation for creating a non-fiction book on this subject.`;

    const response = await this.llmClient.generateCompletion(prompt, {
      systemMessage,
      temperature: 0.5,
      maxTokens: 8000
    });

    return {
      content: response.content,
      wordCount: response.content.split(' ').length,
      sections: this.extractSections(response.content),
      readabilityScore: this.assessReadability(response.content)
    };
  }

  /**
   * Simulated academic source gathering
   */
  async gatherAcademicSources(topic, researchPlan) {
    // Simulate academic research
    const academicData = [
      {
        type: 'academic',
        title: `Research on ${topic}: Current State`,
        source: 'Academic Database',
        credibility: 0.9,
        relevance: 0.8,
        content: `Academic research shows significant developments in ${topic}...`,
        date: new Date().toISOString()
      }
    ];

    this.sources.push(...academicData);
    return academicData;
  }

  /**
   * Simulated news source gathering
   */
  async gatherNewsSources(topic, timeframe) {
    const newsData = [
      {
        type: 'news',
        title: `Latest developments in ${topic}`,
        source: 'Industry News',
        credibility: 0.7,
        relevance: 0.9,
        content: `Recent news indicates growing interest in ${topic}...`,
        date: new Date().toISOString()
      }
    ];

    this.sources.push(...newsData);
    return newsData;
  }

  /**
   * Simulated social media insights gathering
   */
  async gatherSocialInsights(topic) {
    const socialData = [
      {
        type: 'social',
        title: `Social sentiment on ${topic}`,
        source: 'Social Media Analysis',
        credibility: 0.6,
        relevance: 0.7,
        content: `Social media discussions show ${topic} trending upward...`,
        date: new Date().toISOString()
      }
    ];

    this.sources.push(...socialData);
    return socialData;
  }

  /**
   * Simulated market data gathering
   */
  async gatherMarketData(topic) {
    const marketData = [
      {
        type: 'market',
        title: `Market analysis for ${topic}`,
        source: 'Market Research',
        credibility: 0.8,
        relevance: 0.8,
        content: `Market data shows ${topic} has strong commercial potential...`,
        date: new Date().toISOString()
      }
    ];

    this.sources.push(...marketData);
    return marketData;
  }

  // Helper methods for parsing and analysis

  extractResearchQuestions(text) {
    const lines = text.split('\n');
    const questions = lines.filter(line => 
      line.includes('?') && (line.includes('What') || line.includes('How') || line.includes('Why'))
    );
    return questions.slice(0, 5);
  }

  extractSubtopics(text) {
    const lines = text.split('\n');
    const subtopics = lines.filter(line => 
      line.match(/^\d+\./) || line.match(/^-/) || line.match(/^\*/)
    );
    return subtopics.slice(0, 10);
  }

  extractKeyFindings(text) {
    // Simple extraction logic - in production, use more sophisticated NLP
    const sentences = text.split('.').filter(s => s.length > 50);
    return sentences.slice(0, 5);
  }

  extractTrends(text) {
    const trendKeywords = ['increase', 'decrease', 'growing', 'declining', 'emerging', 'trend'];
    const sentences = text.split('.').filter(s => 
      trendKeywords.some(keyword => s.toLowerCase().includes(keyword))
    );
    return sentences.slice(0, 3);
  }

  extractSections(text) {
    const sections = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^#+\s/) || line.match(/^\d+\.\s[A-Z]/)) {
        sections.push(line.trim());
      }
    });
    
    return sections;
  }

  assessCredibility(rawData) {
    let totalScore = 0;
    let count = 0;
    
    Object.values(rawData).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(item => {
          if (item.credibility) {
            totalScore += item.credibility;
            count++;
          }
        });
      }
    });
    
    return count > 0 ? (totalScore / count).toFixed(2) : 0.5;
  }

  assessReadability(text) {
    // Simple readability score - in production, use proper algorithms
    const words = text.split(' ').length;
    const sentences = text.split('.').length;
    const avgWordsPerSentence = words / sentences;
    
    // Simplified score (lower is more readable)
    return Math.min(10, Math.max(1, avgWordsPerSentence / 2));
  }
}
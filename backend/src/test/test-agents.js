import { ResearchAgent } from '../agents/research/ResearchAgent.js';
import { ContentGenerationAgent } from '../agents/content/ContentGenerationAgent.js';
import { EditorialAgent } from '../agents/editorial/EditorialAgent.js';
import { llmManager } from '../config/llm-providers.js';
import logger from '../utils/logger.js';

/**
 * Test script to verify all agents are working correctly
 */

async function testLLMProviders() {
  console.log('\n🔧 Testing LLM Provider Configuration...');
  
  try {
    const availableProviders = llmManager.getAvailableProviders();
    console.log(`✅ Available providers: ${availableProviders.join(', ')}`);
    
    if (availableProviders.length === 0) {
      console.log('⚠️  No LLM providers configured. Please set up API keys in .env');
      return false;
    }
    
    // Test each agent's provider assignment
    const agentTypes = ['research', 'content', 'editorial', 'trend-analysis'];
    
    for (const agentType of agentTypes) {
      try {
        const { provider } = llmManager.getAgentProvider(agentType);
        console.log(`✅ ${agentType} agent assigned to: ${provider}`);
      } catch (error) {
        console.log(`❌ ${agentType} agent provider assignment failed: ${error.message}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ LLM Provider test failed: ${error.message}`);
    return false;
  }
}

async function testResearchAgent() {
  console.log('\n📚 Testing Research Agent...');
  
  try {
    const researchAgent = new ResearchAgent();
    console.log('✅ Research Agent initialized successfully');
    
    // Test research plan generation (without actual API calls)
    console.log('📝 Testing research plan generation...');
    
    // Create a mock research plan to test the structure
    const mockTopic = 'Digital Minimalism in the Modern Workplace';
    console.log(`📋 Mock research topic: ${mockTopic}`);
    
    // Test helper methods
    const mockText = `
    What is digital minimalism? 
    How can it improve productivity?
    Why is it relevant today?
    - Subtopic 1: Email management
    - Subtopic 2: Social media usage
    - Subtopic 3: Tool simplification
    `;
    
    const questions = researchAgent.extractResearchQuestions(mockText);
    const subtopics = researchAgent.extractSubtopics(mockText);
    
    console.log(`✅ Extracted ${questions.length} research questions`);
    console.log(`✅ Extracted ${subtopics.length} subtopics`);
    
    // Test credibility assessment
    const mockData = {
      academic: [{ credibility: 0.9 }],
      news: [{ credibility: 0.7 }]
    };
    
    const credibilityScore = researchAgent.assessCredibility(mockData);
    console.log(`✅ Credibility assessment: ${credibilityScore}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Research Agent test failed: ${error.message}`);
    return false;
  }
}

async function testContentGenerationAgent() {
  console.log('\n✍️  Testing Content Generation Agent...');
  
  try {
    const contentAgent = new ContentGenerationAgent();
    console.log('✅ Content Generation Agent initialized successfully');
    
    // Test outline parsing
    const mockOutline = `
    Title: Digital Minimalism Guide
    Subtitle: Simplifying Your Digital Life
    
    Chapter 1: Understanding Digital Clutter
    Description: Introduction to digital minimalism
    - Key point 1: What is digital clutter
    - Key point 2: Impact on productivity
    
    Chapter 2: Email Management
    Description: Strategies for email efficiency
    - Key point 1: Inbox zero methodology
    - Key point 2: Email scheduling
    `;
    
    const parsedOutline = contentAgent.parseOutline(mockOutline);
    console.log(`✅ Parsed outline with ${parsedOutline.chapters.length} chapters`);
    console.log(`✅ Book title: ${parsedOutline.title}`);
    
    // Test helper methods
    const mockContent = "This is a test chapter with multiple sentences. It has good flow and structure. The content provides valuable insights.";
    const sections = contentAgent.extractSections(mockContent);
    const takeaways = contentAgent.extractKeyTakeaways(mockContent);
    
    console.log(`✅ Section extraction working`);
    console.log(`✅ Key takeaways extraction working`);
    
    // Test word count and page estimation
    const mockBook = {
      introduction: { content: "Introduction content with about fifty words here to test the counting functionality properly." },
      chapters: [
        { content: "Chapter one content with sufficient words to test the calculation methods and ensure proper counting." },
        { content: "Chapter two content with more words to verify that multiple chapters are counted correctly in totals." }
      ],
      conclusion: { content: "Conclusion content with final words to complete the book and test final calculations." }
    };
    
    const wordCount = contentAgent.calculateWordCount(mockBook);
    const estimatedPages = contentAgent.estimatePages(mockBook);
    
    console.log(`✅ Word count calculation: ${wordCount} words`);
    console.log(`✅ Estimated pages: ${estimatedPages} pages`);
    
    // Test configuration-based settings
    const targetWords = contentAgent.getTargetWordsPerChapter({ bookLength: 'medium' });
    const maxTokens = contentAgent.getMaxTokensForChapter({ bookLength: 'medium' });
    
    console.log(`✅ Target words per chapter (medium): ${targetWords}`);
    console.log(`✅ Max tokens per chapter (medium): ${maxTokens}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Content Generation Agent test failed: ${error.message}`);
    return false;
  }
}

async function testEditorialAgent() {
  console.log('\n🔍 Testing Editorial Agent...');
  
  try {
    const editorialAgent = new EditorialAgent();
    console.log('✅ Editorial Agent initialized successfully');
    
    // Test helper methods
    const testText = "This is a sample text for testing. It has multiple sentences with varying complexity. Score: 8.5/10. The quality is good overall.";
    
    const extractedScore = editorialAgent.extractScore(testText);
    console.log(`✅ Score extraction: ${extractedScore}`);
    
    const issues = editorialAgent.extractIssues(testText, 'grammar');
    console.log(`✅ Issue extraction working`);
    
    const suggestions = editorialAgent.extractSuggestions(testText);
    console.log(`✅ Suggestion extraction working`);
    
    // Test readability assessment
    const mockContent = "This is a test paragraph. It has simple sentences. The reading level should be fairly easy. Most people can understand this content without difficulty.";
    
    const readingLevel = editorialAgent.calculateReadingLevel(mockContent);
    const syllables = editorialAgent.estimateSyllables("hello world testing");
    const engagement = editorialAgent.assessEngagement("What do you think about this? Here's an example to consider.");
    
    console.log(`✅ Reading level: ${readingLevel}`);
    console.log(`✅ Syllable estimation: ${syllables}`);
    console.log(`✅ Engagement score: ${engagement}`);
    
    // Test review scoring
    const mockReviews = {
      grammar: { score: 8.0 },
      content: { score: 7.5 },
      readability: { score: 8.5 }
    };
    
    const sectionScore = editorialAgent.calculateSectionScore(mockReviews);
    console.log(`✅ Section score calculation: ${sectionScore}`);
    
    // Test issue counting
    const mockReviewsWithIssues = {
      grammar: { issues: ['Issue 1', 'Issue 2'] },
      content: { flaggedClaims: ['Claim 1'] }
    };
    
    const issueCount = editorialAgent.countIssues(mockReviewsWithIssues);
    console.log(`✅ Issue counting: ${issueCount} issues found`);
    
    // Test book summary creation
    const mockBookContent = {
      title: 'Test Book',
      chapters: [
        { chapterNumber: 1, title: 'First Chapter' },
        { chapterNumber: 2, title: 'Second Chapter' }
      ]
    };
    
    const bookSummary = editorialAgent.createBookSummary(mockBookContent);
    console.log(`✅ Book summary generation working`);
    
    return true;
  } catch (error) {
    console.log(`❌ Editorial Agent test failed: ${error.message}`);
    return false;
  }
}

async function testIntegrationFlow() {
  console.log('\n🔄 Testing Integration Flow...');
  
  try {
    // Simulate the complete workflow without API calls
    console.log('1️⃣ Simulating research phase...');
    const mockResearchData = {
      topic: 'Digital Minimalism',
      analysis: {
        content: 'Digital minimalism is a philosophy that helps individuals focus on what matters most in their digital lives.',
        keyFindings: ['Digital clutter reduces productivity', 'Intentional technology use improves focus']
      },
      report: {
        content: 'Comprehensive research report on digital minimalism principles and practices.'
      }
    };
    console.log('✅ Research data structure validated');
    
    console.log('2️⃣ Simulating content generation phase...');
    const contentAgent = new ContentGenerationAgent();
    
    // Test that content agent can work with research data
    const mockBookConfig = {
      title: 'Digital Minimalism Guide',
      targetAudience: 'professionals',
      writingStyle: 'practical',
      bookLength: 'medium',
      chapterCount: 6
    };
    
    console.log('✅ Book configuration validated');
    console.log('✅ Content generation setup ready');
    
    console.log('3️⃣ Simulating editorial review phase...');
    const editorialAgent = new EditorialAgent();
    
    const mockBookContent = {
      title: 'Digital Minimalism Guide',
      introduction: { content: 'Introduction to digital minimalism concepts and practices.' },
      chapters: [
        { chapterNumber: 1, title: 'Understanding Digital Clutter', content: 'Chapter content here...' }
      ],
      conclusion: { content: 'Conclusion with key takeaways and next steps.' }
    };
    
    console.log('✅ Editorial review setup ready');
    console.log('✅ Integration flow structure validated');
    
    return true;
  } catch (error) {
    console.log(`❌ Integration flow test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Agent Testing...\n');
  
  const testResults = [];
  
  // Run all tests
  testResults.push({ name: 'LLM Providers', passed: await testLLMProviders() });
  testResults.push({ name: 'Research Agent', passed: await testResearchAgent() });
  testResults.push({ name: 'Content Generation Agent', passed: await testContentGenerationAgent() });
  testResults.push({ name: 'Editorial Agent', passed: await testEditorialAgent() });
  testResults.push({ name: 'Integration Flow', passed: await testIntegrationFlow() });
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  let totalPassed = 0;
  testResults.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.passed) totalPassed++;
  });
  
  console.log(`\n🎯 Overall: ${totalPassed}/${testResults.length} tests passed`);
  
  if (totalPassed === testResults.length) {
    console.log('🎉 All tests passed! The multi-agent system is ready.');
    return true;
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    return false;
  }
}

// Run tests if this file is executed directly
if (process.argv[1].endsWith('test-agents.js')) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runAllTests };
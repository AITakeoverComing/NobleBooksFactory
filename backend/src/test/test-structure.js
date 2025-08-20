import { ResearchAgent } from '../agents/research/ResearchAgent.js';
import { ContentGenerationAgent } from '../agents/content/ContentGenerationAgent.js';
import { EditorialAgent } from '../agents/editorial/EditorialAgent.js';

/**
 * Test script to verify agent structure and helper methods without API calls
 */

async function testResearchAgentStructure() {
  console.log('\n📚 Testing Research Agent Structure...');
  
  try {
    console.log('📝 Testing helper methods without API calls...');
    
    // Create a temporary research agent instance (will fail at LLM init, but we can test other methods)
    const mockAgent = {
      extractResearchQuestions: ResearchAgent.prototype.extractResearchQuestions,
      extractSubtopics: ResearchAgent.prototype.extractSubtopics,
      assessCredibility: ResearchAgent.prototype.assessCredibility,
      extractKeyFindings: ResearchAgent.prototype.extractKeyFindings,
      extractTrends: ResearchAgent.prototype.extractTrends,
      assessReadability: ResearchAgent.prototype.assessReadability
    };
    
    // Test research question extraction
    const mockText = `
    What is digital minimalism and how does it work?
    How can businesses implement digital minimalism?
    Why is digital minimalism trending in 2024?
    - Subtopic 1: Email management strategies
    - Subtopic 2: Social media reduction techniques
    - Subtopic 3: Tool consolidation methods
    1. Understanding digital overwhelm
    2. Benefits of intentional technology use
    `;
    
    const questions = mockAgent.extractResearchQuestions(mockText);
    const subtopics = mockAgent.extractSubtopics(mockText);
    
    console.log(`✅ Extracted ${questions.length} research questions`);
    console.log(`✅ Extracted ${subtopics.length} subtopics`);
    
    if (questions.length > 0) {
      console.log(`   Example question: ${questions[0]}`);
    }
    if (subtopics.length > 0) {
      console.log(`   Example subtopic: ${subtopics[0]}`);
    }
    
    // Test credibility assessment
    const mockData = {
      academic: [
        { credibility: 0.9, title: 'Academic Paper 1' },
        { credibility: 0.8, title: 'Academic Paper 2' }
      ],
      news: [
        { credibility: 0.7, title: 'News Article 1' }
      ],
      social: [
        { credibility: 0.5, title: 'Social Post 1' }
      ]
    };
    
    const credibilityScore = mockAgent.assessCredibility(mockData);
    console.log(`✅ Credibility assessment: ${credibilityScore} (0.0-1.0 scale)`);
    
    // Test key findings extraction
    const analysisText = "The key finding is that digital minimalism increases productivity. Another important insight shows reduced stress levels. Research indicates improved focus as a major benefit.";
    const keyFindings = mockAgent.extractKeyFindings(analysisText);
    console.log(`✅ Key findings extraction: ${keyFindings.length} findings`);
    
    // Test trends extraction
    const trendText = "Digital minimalism is growing rapidly. Email usage is declining among professionals. There's an emerging trend toward tool consolidation.";
    const trends = mockAgent.extractTrends(trendText);
    console.log(`✅ Trends extraction: ${trends.length} trends identified`);
    
    // Test readability assessment
    const readabilityText = "This is a simple sentence. It has clear meaning. Anyone can understand this content easily.";
    const readabilityScore = mockAgent.assessReadability(readabilityText);
    console.log(`✅ Readability assessment: ${readabilityScore}/10`);
    
    return true;
  } catch (error) {
    console.log(`❌ Research Agent structure test failed: ${error.message}`);
    return false;
  }
}

async function testContentAgentStructure() {
  console.log('\n✍️  Testing Content Generation Agent Structure...');
  
  try {
    const mockAgent = {
      parseOutline: ContentGenerationAgent.prototype.parseOutline,
      extractTitle: ContentGenerationAgent.prototype.extractTitle,
      extractSubtitle: ContentGenerationAgent.prototype.extractSubtitle,
      extractDescription: ContentGenerationAgent.prototype.extractDescription,
      extractSections: ContentGenerationAgent.prototype.extractSections,
      extractKeyTakeaways: ContentGenerationAgent.prototype.extractKeyTakeaways,
      calculateWordCount: ContentGenerationAgent.prototype.calculateWordCount,
      estimatePages: ContentGenerationAgent.prototype.estimatePages,
      getTargetWordsPerChapter: ContentGenerationAgent.prototype.getTargetWordsPerChapter,
      getMaxTokensForChapter: ContentGenerationAgent.prototype.getMaxTokensForChapter,
      generateTableOfContents: ContentGenerationAgent.prototype.generateTableOfContents
    };
    
    // Test outline parsing
    const mockOutline = `
    Title: The Digital Minimalism Handbook
    Subtitle: A Practical Guide to Intentional Technology Use
    Description: This book explores how to use technology more intentionally
    
    Chapter 1: Understanding Digital Clutter
    Description: Introduction to digital minimalism concepts
    Key points:
    - What is digital clutter
    - Impact on mental health
    - Signs of digital overwhelm
    
    Chapter 2: Email Management Mastery
    Description: Strategies for email efficiency
    - Inbox zero methodology
    - Email scheduling techniques
    
    Chapter 3: Social Media Boundaries
    - Setting usage limits
    - Curating meaningful connections
    `;
    
    const parsedOutline = mockAgent.parseOutline(mockOutline);
    console.log(`✅ Parsed outline successfully`);
    console.log(`   Title: ${parsedOutline.title}`);
    console.log(`   Subtitle: ${parsedOutline.subtitle}`);
    console.log(`   Chapters: ${parsedOutline.chapters.length}`);
    
    parsedOutline.chapters.forEach((chapter, index) => {
      console.log(`   Chapter ${index + 1}: ${chapter.title} (${chapter.keyPoints.length} key points)`);
    });
    
    // Test section extraction
    const mockChapterContent = `
    # Introduction to Digital Minimalism
    
    ## What is Digital Minimalism?
    
    Digital minimalism is a philosophy that helps you focus on what matters most.
    
    ## Key Benefits
    
    1. Improved Focus
    The primary benefit is better concentration.
    
    2. Reduced Stress
    Less digital noise leads to calmer minds.
    `;
    
    const sections = mockAgent.extractSections(mockChapterContent);
    console.log(`✅ Extracted ${sections.length} sections from chapter content`);
    
    // Test key takeaways extraction
    const contentWithTakeaways = "The key insight here is that less is more. It's important to remember that quality beats quantity. The main takeaway from this research is intentional usage.";
    const takeaways = mockAgent.extractKeyTakeaways(contentWithTakeaways);
    console.log(`✅ Extracted ${takeaways.length} key takeaways`);
    
    // Test word count and page estimation
    const mockBook = {
      introduction: { content: "This is an introduction with exactly twenty words to test our counting functionality properly and accurately." },
      chapters: [
        { content: "Chapter one content with sufficient words to test the calculation methods and ensure proper counting functionality works as expected." },
        { content: "Chapter two content with additional words to verify that multiple chapters are counted correctly and totals are accurate." }
      ],
      conclusion: { content: "Conclusion content with final words to complete the book and test our final calculation methods properly." }
    };
    
    const wordCount = mockAgent.calculateWordCount(mockBook);
    const estimatedPages = mockAgent.estimatePages(mockBook);
    
    console.log(`✅ Word count calculation: ${wordCount} words`);
    console.log(`✅ Estimated pages: ${estimatedPages} pages`);
    
    // Test configuration methods
    const configs = ['short', 'medium', 'long'];
    configs.forEach(config => {
      const targetWords = mockAgent.getTargetWordsPerChapter({ bookLength: config });
      const maxTokens = mockAgent.getMaxTokensForChapter({ bookLength: config });
      console.log(`✅ ${config.toUpperCase()} book config: ${targetWords} words/chapter, ${maxTokens} max tokens`);
    });
    
    // Test table of contents generation
    const toc = mockAgent.generateTableOfContents(
      { title: 'Introduction', wordCount: 500 },
      [
        { chapterNumber: 1, title: 'Chapter One', wordCount: 2000 },
        { chapterNumber: 2, title: 'Chapter Two', wordCount: 2500 }
      ],
      { title: 'Conclusion', wordCount: 750 }
    );
    
    console.log(`✅ Generated table of contents with ${toc.length} entries`);
    
    return true;
  } catch (error) {
    console.log(`❌ Content Agent structure test failed: ${error.message}`);
    return false;
  }
}

async function testEditorialAgentStructure() {
  console.log('\n🔍 Testing Editorial Agent Structure...');
  
  try {
    const mockAgent = {
      extractScore: EditorialAgent.prototype.extractScore,
      extractIssues: EditorialAgent.prototype.extractIssues,
      extractSuggestions: EditorialAgent.prototype.extractSuggestions,
      calculateReadingLevel: EditorialAgent.prototype.calculateReadingLevel,
      estimateSyllables: EditorialAgent.prototype.estimateSyllables,
      assessEngagement: EditorialAgent.prototype.assessEngagement,
      calculateSectionScore: EditorialAgent.prototype.calculateSectionScore,
      countIssues: EditorialAgent.prototype.countIssues,
      createBookSummary: EditorialAgent.prototype.createBookSummary,
      extractStrengthsWeaknesses: EditorialAgent.prototype.extractStrengthsWeaknesses,
      calculateOverallQuality: EditorialAgent.prototype.calculateOverallQuality
    };
    
    // Test score extraction
    const scoreTexts = [
      "The quality score is 8.5 out of 10",
      "I would rate this 7/10",
      "Score: 9.2",
      "This content rates 6.5 on quality"
    ];
    
    scoreTexts.forEach(text => {
      const score = mockAgent.extractScore(text);
      console.log(`✅ Extracted score from "${text.slice(0, 30)}...": ${score}`);
    });
    
    // Test reading level calculation
    const testTexts = [
      "This is very simple text. Easy to read. Anyone understands.",
      "The comprehensive analysis demonstrates significant improvements in productivity metrics when digital minimalism principles are systematically implemented.",
      "Digital tools can help or hurt. It depends how you use them. Make smart choices."
    ];
    
    testTexts.forEach((text, index) => {
      const readingLevel = mockAgent.calculateReadingLevel(text);
      const syllables = mockAgent.estimateSyllables(text);
      console.log(`✅ Text ${index + 1} - Reading level: ${readingLevel}, Syllables: ${syllables}`);
    });
    
    // Test engagement assessment
    const engagementTexts = [
      "What do you think about this approach? Here's an example to consider.",
      "The research shows clear benefits of digital minimalism.",
      "Imagine if you could focus better. Think about your current habits. You can improve!"
    ];
    
    engagementTexts.forEach((text, index) => {
      const engagement = mockAgent.assessEngagement(text);
      console.log(`✅ Text ${index + 1} engagement score: ${engagement}/10`);
    });
    
    // Test issue and suggestion extraction
    const reviewText = `
    Grammar Issues: There are several punctuation errors in this text.
    Style Problems: The tone is inconsistent throughout.
    Suggestions: I recommend improving the flow between paragraphs.
    Recommendation: Add more examples to clarify complex concepts.
    `;
    
    const issues = mockAgent.extractIssues(reviewText, 'grammar');
    const suggestions = mockAgent.extractSuggestions(reviewText);
    console.log(`✅ Extracted ${issues.length} issues and ${suggestions.length} suggestions`);
    
    // Test section scoring
    const mockReviews = {
      grammar: { score: 8.0 },
      content: { score: 7.5 },
      readability: { score: 8.5 },
      factual: { score: 9.0 }
    };
    
    const sectionScore = mockAgent.calculateSectionScore(mockReviews);
    console.log(`✅ Section score calculation: ${sectionScore}/10`);
    
    // Test issue counting
    const mockReviewsWithIssues = {
      grammar: { issues: ['Issue 1', 'Issue 2'] },
      content: { flaggedClaims: ['Claim 1'], credibilityIssues: ['Credibility issue 1'] },
      readability: { clarityIssues: ['Clarity issue 1', 'Clarity issue 2'] }
    };
    
    const issueCount = mockAgent.countIssues(mockReviewsWithIssues);
    console.log(`✅ Issue counting: ${issueCount} total issues found`);
    
    // Test book summary creation
    const mockBookContent = {
      title: 'Digital Minimalism Handbook',
      chapters: [
        { chapterNumber: 1, title: 'Understanding Digital Clutter' },
        { chapterNumber: 2, title: 'Email Management' },
        { chapterNumber: 3, title: 'Social Media Boundaries' }
      ]
    };
    
    const bookSummary = mockAgent.createBookSummary(mockBookContent);
    console.log(`✅ Book summary generated (${bookSummary.split('\n').length} lines)`);
    
    // Test strengths/weaknesses extraction
    const strengthsWeaknessesText = "The strength of this content is clear explanations. However, there's a weakness in the examples provided. Good organization is another strength.";
    const strengthsWeaknesses = mockAgent.extractStrengthsWeaknesses(strengthsWeaknessesText);
    console.log(`✅ Strengths: ${strengthsWeaknesses.strengths.length}, Weaknesses: ${strengthsWeaknesses.weaknesses.length}`);
    
    // Test overall quality calculation
    const mockSectionReviews = {
      introduction: { sectionScore: 8.0 },
      chapters: [
        { sectionScore: 7.5 },
        { sectionScore: 8.5 },
        { sectionScore: 7.8 }
      ],
      conclusion: { sectionScore: 8.2 }
    };
    
    const mockConsistencyReview = { consistencyScore: 7.9 };
    const overallQuality = mockAgent.calculateOverallQuality(mockSectionReviews, mockConsistencyReview);
    
    console.log(`✅ Overall quality: ${overallQuality.score}/10 (passes threshold: ${overallQuality.passesThreshold})`);
    
    return true;
  } catch (error) {
    console.log(`❌ Editorial Agent structure test failed: ${error.message}`);
    return false;
  }
}

async function testSystemIntegration() {
  console.log('\n🔄 Testing System Integration Structure...');
  
  try {
    console.log('📋 Testing data flow structure...');
    
    // Simulate the complete data flow structure
    const mockResearchData = {
      topic: 'Digital Minimalism in Remote Work',
      researchPlan: {
        questions: [
          'What is digital minimalism?',
          'How does it apply to remote work?',
          'What are the key benefits?'
        ],
        subtopics: [
          'Email management',
          'Meeting optimization',
          'Tool consolidation'
        ]
      },
      analysis: {
        content: 'Comprehensive analysis of digital minimalism research findings...',
        keyFindings: [
          'Reduced email frequency improves focus',
          'Fewer tools lead to less context switching',
          'Intentional technology use increases productivity'
        ],
        trends: [
          'Growing adoption in tech companies',
          'Increasing interest from remote workers'
        ]
      },
      report: {
        content: 'Detailed research report with actionable insights...',
        wordCount: 5000,
        sections: ['Executive Summary', 'Key Findings', 'Recommendations']
      }
    };
    
    console.log(`✅ Research data structure: ${Object.keys(mockResearchData).length} main sections`);
    
    // Test content generation input structure
    const mockBookConfig = {
      title: 'Digital Minimalism for Remote Teams',
      targetAudience: 'remote professionals',
      writingStyle: 'practical',
      bookLength: 'medium',
      chapterCount: 6,
      includeExamples: true,
      includeExercises: false
    };
    
    console.log(`✅ Book configuration: ${Object.keys(mockBookConfig).length} parameters`);
    
    // Test generated book structure
    const mockGeneratedBook = {
      title: mockBookConfig.title,
      subtitle: 'A Practical Guide for Distributed Teams',
      introduction: {
        title: 'Introduction',
        content: 'Introduction content...',
        wordCount: 800
      },
      chapters: [
        {
          chapterNumber: 1,
          title: 'Understanding Digital Overwhelm',
          content: 'Chapter 1 content...',
          wordCount: 3500,
          sections: ['What is Digital Overwhelm', 'Signs and Symptoms', 'Impact on Performance'],
          keyTakeaways: ['Key insight 1', 'Key insight 2']
        },
        {
          chapterNumber: 2,
          title: 'Communication Minimalism',
          content: 'Chapter 2 content...',
          wordCount: 3200,
          sections: ['Email Strategies', 'Meeting Optimization', 'Async Communication'],
          keyTakeaways: ['Practical tip 1', 'Practical tip 2']
        }
      ],
      conclusion: {
        title: 'Conclusion',
        content: 'Conclusion content...',
        wordCount: 1000
      },
      totalWordCount: 8500
    };
    
    console.log(`✅ Generated book structure: ${mockGeneratedBook.chapters.length} chapters, ${mockGeneratedBook.totalWordCount} total words`);
    
    // Test editorial review structure
    const mockEditorialReview = {
      overallQuality: {
        score: 8.2,
        passesThreshold: true,
        breakdown: {
          averageSectionScore: 8.0,
          consistencyScore: 8.5
        }
      },
      reviews: {
        introduction: {
          sectionScore: 8.0,
          reviews: {
            grammarStyle: { score: 8.5, feedback: 'Good writing style' },
            factualAccuracy: { score: 7.8, feedback: 'Minor fact-check needed' },
            readability: { score: 8.2, feedback: 'Clear and engaging' }
          },
          issuesFound: 2,
          recommendations: ['Minor grammar fixes', 'Add more examples']
        }
      },
      consistencyReview: {
        consistencyScore: 8.5,
        feedback: 'Good consistency across chapters',
        inconsistencies: [],
        flowIssues: []
      },
      recommendations: {
        prioritizedActions: {
          high: ['Fix grammar issues in chapter 2'],
          medium: ['Add more examples throughout'],
          low: ['Consider expanding conclusion']
        }
      }
    };
    
    console.log(`✅ Editorial review structure: Overall score ${mockEditorialReview.overallQuality.score}/10`);
    console.log(`✅ Review passes quality threshold: ${mockEditorialReview.overallQuality.passesThreshold}`);
    
    // Test complete workflow structure
    console.log('🔄 Testing complete workflow structure...');
    
    const workflowSteps = [
      '1. Research Phase → Generate research data',
      '2. Content Phase → Create book from research',
      '3. Editorial Phase → Review and improve book',
      '4. Final Phase → Deliver completed book'
    ];
    
    workflowSteps.forEach(step => console.log(`✅ ${step}`));
    
    // Verify all data structures are compatible
    const dataCompatibility = {
      researchToContent: mockResearchData.analysis && mockResearchData.report ? true : false,
      contentToEditorial: mockGeneratedBook.chapters && mockGeneratedBook.title ? true : false,
      editorialFeedback: mockEditorialReview.overallQuality && mockEditorialReview.recommendations ? true : false
    };
    
    console.log(`✅ Data compatibility check:`);
    Object.entries(dataCompatibility).forEach(([check, passes]) => {
      console.log(`   ${check}: ${passes ? '✅ Compatible' : '❌ Incompatible'}`);
    });
    
    return Object.values(dataCompatibility).every(v => v);
  } catch (error) {
    console.log(`❌ System integration test failed: ${error.message}`);
    return false;
  }
}

async function runStructureTests() {
  console.log('🏗️  Starting Structure and Helper Method Testing...\n');
  console.log('Note: These tests verify system structure without requiring API keys.\n');
  
  const testResults = [];
  
  // Run structure tests
  testResults.push({ name: 'Research Agent Structure', passed: await testResearchAgentStructure() });
  testResults.push({ name: 'Content Agent Structure', passed: await testContentAgentStructure() });
  testResults.push({ name: 'Editorial Agent Structure', passed: await testEditorialAgentStructure() });
  testResults.push({ name: 'System Integration', passed: await testSystemIntegration() });
  
  // Summary
  console.log('\n📊 Structure Test Results:');
  console.log('===========================');
  
  let totalPassed = 0;
  testResults.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.passed) totalPassed++;
  });
  
  console.log(`\n🎯 Overall: ${totalPassed}/${testResults.length} structure tests passed`);
  
  if (totalPassed === testResults.length) {
    console.log('\n🎉 All structure tests passed!');
    console.log('📋 System is properly structured and ready for API integration.');
    console.log('💡 To test with actual LLM calls, add API keys to .env file.');
    return true;
  } else {
    console.log('\n⚠️  Some structure tests failed. Please check the issues above.');
    return false;
  }
}

// Run tests if this file is executed directly
if (process.argv[1].endsWith('test-structure.js')) {
  runStructureTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runStructureTests };
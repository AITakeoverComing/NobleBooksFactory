/**
 * API service for connecting to Python FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface BookCreateRequest {
  topic: string;
  target_audience: string;
  writing_style: string;
  book_length: string;
  chapter_count: number;
  include_examples: boolean;
  include_exercises: boolean;
}

export interface BookResponse {
  id: string;
  topic: string;
  status: string;
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
  message?: string;
  error_message?: string;
}

export interface AgentStatus {
  name: string;
  state: string;
  current_task?: string;
  current_task_progress: number;
  last_activity?: string;
  error_message?: string;
}

export interface AgentStatsResponse {
  agents: AgentStatus[];
  system_status: string;
  total_books_generated: number;
  active_generations: number;
  uptime: string;
}

class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1`;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request to ${url} failed:`, error);
      throw error;
    }
  }

  // Health endpoints
  async getHealth() {
    return this.makeRequest('/health');
  }

  async getDetailedHealth() {
    return this.makeRequest('/health/detailed');
  }

  // Book endpoints
  async createBook(request: BookCreateRequest): Promise<BookResponse> {
    return this.makeRequest('/books', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getBook(bookId: string): Promise<BookResponse> {
    return this.makeRequest(`/books/${bookId}`);
  }

  async listBooks(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    return this.makeRequest(`/books?${params}`);
  }

  async deleteBook(bookId: string): Promise<void> {
    await this.makeRequest(`/books/${bookId}`, {
      method: 'DELETE',
    });
  }

  async cancelBookGeneration(bookId: string): Promise<void> {
    await this.makeRequest(`/books/${bookId}/cancel`, {
      method: 'POST',
    });
  }

  async getBookContent(bookId: string) {
    return this.makeRequest(`/books/${bookId}/content`);
  }

  async getBookProgress(bookId: string) {
    return this.makeRequest(`/books/${bookId}/progress`);
  }

  // Agent endpoints
  async getAgentsStatus(): Promise<AgentStatsResponse> {
    return this.makeRequest('/agents/status');
  }

  async getAgentStatus(agentName: string): Promise<AgentStatus> {
    return this.makeRequest(`/agents/${agentName}/status`);
  }

  async resetAgent(agentName: string): Promise<void> {
    await this.makeRequest(`/agents/${agentName}/reset`, {
      method: 'POST',
    });
  }

  async resetAllAgents(): Promise<void> {
    await this.makeRequest('/agents/reset-all', {
      method: 'POST',
    });
  }

  async getAgentsHealth() {
    return this.makeRequest('/agents/health');
  }

  async getAgentsMetrics() {
    return this.makeRequest('/agents/metrics');
  }

  // WebSocket connection for real-time updates
  createWebSocket(clientId: string): WebSocket {
    const wsUrl = API_BASE_URL.replace('http', 'ws');
    return new WebSocket(`${wsUrl}/ws/${clientId}`);
  }
}

export const apiService = new APIService();
export default apiService;
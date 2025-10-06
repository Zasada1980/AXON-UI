// Типы для системы памяти агентов дебатов и аудита

export interface MemoryEntry {
  id: string;
  timestamp: string;
  agentId: string;
  projectId: string;
  type: 'debate' | 'audit' | 'decision' | 'insight';
  content: string;
  context: {
    module: string;
    action: string;
    relevance: number; // 0-100 оценка релевантности
    accuracy: number; // 0-100 оценка точности
  };
  tags: string[];
  verified: boolean;
  source: 'manual' | 'automated' | 'debate' | 'audit';
}

export interface MemoryFile {
  id: string;
  agentId: string;
  projectId: string;
  name: string;
  description: string;
  createdAt: string;
  lastUpdated: string;
  entries: MemoryEntry[];
  metadata: {
    totalEntries: number;
    averageRelevance: number;
    verificationCycles: number;
    lastVerification: string;
  };
  status: 'pending' | 'verifying' | 'verified' | 'curated' | 'active';
}

export interface AgentMemorySystem {
  agentId: string;
  agentType: 'debate' | 'audit' | 'security' | 'bias' | 'performance' | 'compliance';
  projectMemories: Map<string, MemoryFile[]>; // projectId -> MemoryFile[]
  globalLearning: MemoryEntry[];
  settings: {
    maxEntries: number;
    retentionDays: number;
    autoCleanup: boolean;
    verificationThreshold: number;
    relevanceThreshold: number;
  };
}

export interface DebateLog {
  id: string;
  sessionId: string;
  round: number;
  agentId: string;
  timestamp: string;
  message: string;
  messageType: 'argument' | 'counter-argument' | 'synthesis' | 'question' | 'conclusion';
  confidence: number;
  supportingData: string[];
  referencedMemories: string[]; // IDs of memory entries used
}

export interface MemoryVerificationCycle {
  id: string;
  memoryFileId: string;
  cycle: number;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  participants: {
    agentId: string;
    role: 'verifier' | 'challenger' | 'moderator';
  }[];
  results: {
    verified: boolean;
    confidence: number;
    changes: MemoryEdit[];
    recommendation: 'accept' | 'reject' | 'modify';
  };
}

export interface MemoryEdit {
  id: string;
  entryId: string;
  type: 'add' | 'remove' | 'modify' | 'tag' | 'relevance_update';
  oldValue?: string;
  newValue?: string;
  reason: string;
  editorId: string; // agent ID who made the edit
  timestamp: string;
  approved: boolean;
}

export interface MemoryCreationRequest {
  projectId: string;
  agentId: string;
  sourceLogIds: string[];
  name: string;
  description: string;
  triggerType: 'manual' | 'automated' | 'scheduled';
  verificationRequired: boolean;
}

export interface MemoryProcessingPipeline {
  id: string;
  request: MemoryCreationRequest;
  status: 'collecting' | 'processing' | 'verifying' | 'curating' | 'completed' | 'failed';
  stages: {
    logCollection: PipelineStage;
    silentVerification: PipelineStage;
    auditCuration: PipelineStage;
    memoryCreation: PipelineStage;
  };
  result?: MemoryFile;
  error?: string;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  progress: number; // 0-100
  details: string;
  logs: string[];
}

export interface AgentJournal {
  agentId: string;
  projectId: string;
  entries: JournalEntry[];
  metadata: {
    startDate: string;
    lastEntry: string;
    totalEntries: number;
    categories: Record<string, number>;
  };
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  category: 'debate' | 'audit' | 'decision' | 'learning' | 'error' | 'success';
  title: string;
  content: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  relatedMemories: string[];
  tags: string[];
  projectContext: {
    module: string;
    phase: string;
    completeness: number;
  };
}
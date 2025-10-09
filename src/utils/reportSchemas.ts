import { z } from 'zod';

// Schema for module features
export const ModuleFeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['planned', 'in-progress', 'completed', 'tested']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedHours: z.number().min(0),
  actualHours: z.number().min(0)
});

// Schema for system modules
export const SystemModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['not-implemented', 'partial', 'implemented', 'tested', 'production-ready']),
  completeness: z.number().min(0).max(100),
  lastUpdated: z.string(),
  dependencies: z.array(z.string()),
  features: z.array(ModuleFeatureSchema),
  issues: z.array(z.string()),
  testCoverage: z.number().min(0).max(100),
  performanceScore: z.number().min(0).max(100)
});

// Schema for project metrics
export const ProjectMetricsSchema = z.object({
  totalModules: z.number().min(0),
  completedModules: z.number().min(0),
  partialModules: z.number().min(0),
  overallProgress: z.number().min(0).max(100),
  testCoverage: z.number().min(0).max(100),
  averagePerformance: z.number().min(0).max(100),
  criticalIssues: z.number().min(0),
  totalFeatures: z.number().min(0),
  completedFeatures: z.number().min(0),
  estimatedHours: z.number().min(0),
  actualHours: z.number().min(0)
});

// Schema for compliance checks
export const ComplianceCheckSchema = z.object({
  id: z.string(),
  category: z.enum(['functionality', 'performance', 'security', 'usability', 'maintainability']),
  requirement: z.string(),
  status: z.enum(['passed', 'failed', 'warning', 'not-tested']),
  details: z.string(),
  criticality: z.enum(['low', 'medium', 'high', 'critical'])
});

// Main schema for system completion report
export const SystemCompletionReportSchema = z.object({
  projectId: z.string().min(1),
  timestamp: z.string(),
  metrics: ProjectMetricsSchema,
  modules: z.array(SystemModuleSchema),
  complianceChecks: z.array(ComplianceCheckSchema)
});

// Schema for journal entries
export const JournalEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['note', 'milestone', 'issue', 'resolution', 'meeting', 'decision']),
  title: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'in-progress', 'completed', 'archived']).optional(),
  attachments: z.array(z.string()).optional()
});

// Schema for master report journal
export const MasterReportJournalSchema = z.object({
  projectId: z.string().min(1),
  timestamp: z.string(),
  entries: z.array(JournalEntrySchema),
  metadata: z.object({
    totalEntries: z.number().min(0),
    lastUpdated: z.string(),
    version: z.string().optional()
  })
});

// Work status metrics schema for enhanced reporting
export const WorkStatusMetricsSchema = z.object({
  tasksTotal: z.number().min(0),
  tasksCompleted: z.number().min(0),
  tasksInProgress: z.number().min(0),
  tasksPending: z.number().min(0),
  averageCompletionTime: z.number().min(0), // in hours
  velocityPerWeek: z.number().min(0),
  burndownRate: z.number().min(0),
  blockers: z.number().min(0),
  teamUtilization: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100)
});

// UI audit metrics schema
export const UIAuditMetricsSchema = z.object({
  componentsTotal: z.number().min(0),
  componentsCompleted: z.number().min(0),
  accessibilityScore: z.number().min(0).max(100),
  performanceScore: z.number().min(0).max(100),
  responsivenessCoverage: z.number().min(0).max(100),
  browserCompatibility: z.number().min(0).max(100),
  designSystemAdherence: z.number().min(0).max(100),
  codeQuality: z.number().min(0).max(100)
});

export type SystemCompletionReport = z.infer<typeof SystemCompletionReportSchema>;
export type MasterReportJournal = z.infer<typeof MasterReportJournalSchema>;
export type WorkStatusMetrics = z.infer<typeof WorkStatusMetricsSchema>;
export type UIAuditMetrics = z.infer<typeof UIAuditMetricsSchema>;
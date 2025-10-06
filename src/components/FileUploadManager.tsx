import React, { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  CloudArrowUp,
  FileText,
  Image,
  FileX,
  Download,
  Eye,
  Trash,
  Tag,
  Clock,
  Database,
  Shield,
  Brain,
  CheckCircle,
  Warning,
  Upload
} from '@phosphor-icons/react';

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  content?: string;
  dataUrl?: string;
  category: 'document' | 'image' | 'data' | 'media' | 'other';
  description?: string;
  tags: string[];
  analysisNotes?: string;
  analysisResults?: FileAnalysisResult[];
}

interface FileAnalysisResult {
  id: string;
  fileId: string;
  agentId: string;
  agentName: string;
  analysisType: 'content' | 'structure' | 'security' | 'metadata';
  results: string[];
  insights: string[];
  timestamp: string;
  confidence: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface FileUploadManagerProps {
  language: 'en' | 'ru';
  projectId: string;
  onFileUploaded?: (file: ProjectFile) => void;
  onFileAnalyzed?: (analysis: FileAnalysisResult) => void;
}

const translations = {
  // File Management
  fileManagement: { en: 'File Management', ru: 'Управление Файлами' },
  uploadFiles: { en: 'Upload Files', ru: 'Загрузить Файлы' },
  uploadFile: { en: 'Upload File', ru: 'Загрузить Файл' },
  fileLibrary: { en: 'File Library', ru: 'Библиотека Файлов' },
  selectFiles: { en: 'Select Files', ru: 'Выбрать Файлы' },
  dragDropFiles: { en: 'Drag and drop files here, or click to select', ru: 'Перетащите файлы сюда или нажмите для выбора' },
  supportedFormats: { en: 'Supported formats', ru: 'Поддерживаемые форматы' },
  fileUploaded: { en: 'File uploaded successfully', ru: 'Файл успешно загружен' },
  fileUploadFailed: { en: 'File upload failed', ru: 'Ошибка загрузки файла' },
  fileName: { en: 'File Name', ru: 'Имя Файла' },
  fileSize: { en: 'File Size', ru: 'Размер Файла' },
  fileType: { en: 'File Type', ru: 'Тип Файла' },
  uploadedAt: { en: 'Uploaded', ru: 'Загружен' },
  fileCategory: { en: 'Category', ru: 'Категория' },
  fileDescription: { en: 'Description', ru: 'Описание' },
  fileTags: { en: 'Tags', ru: 'Теги' },
  addTags: { en: 'Add tags...', ru: 'Добавить теги...' },
  analyzeFile: { en: 'Analyze File', ru: 'Анализировать Файл' },
  fileAnalysis: { en: 'File Analysis', ru: 'Анализ Файла' },
  removeFile: { en: 'Remove File', ru: 'Удалить Файл' },
  downloadFile: { en: 'Download File', ru: 'Скачать Файл' },
  previewFile: { en: 'Preview File', ru: 'Предпросмотр Файла' },
  
  // File Categories
  document: { en: 'Document', ru: 'Документ' },
  image: { en: 'Image', ru: 'Изображение' },
  data: { en: 'Data', ru: 'Данные' },
  media: { en: 'Media', ru: 'Медиа' },
  other: { en: 'Other', ru: 'Другое' },
  
  // File Analysis
  contentAnalysis: { en: 'Content Analysis', ru: 'Анализ Содержания' },
  structureAnalysis: { en: 'Structure Analysis', ru: 'Анализ Структуры' },
  securityAnalysis: { en: 'Security Analysis', ru: 'Анализ Безопасности' },
  metadataAnalysis: { en: 'Metadata Analysis', ru: 'Анализ Метаданных' },
  analysisResults: { en: 'Analysis Results', ru: 'Результаты Анализа' },
  confidence: { en: 'Confidence', ru: 'Достоверность' },
  noFilesUploaded: { en: 'No files uploaded yet', ru: 'Файлы еще не загружены' },
  fileAnalysisStarted: { en: 'File analysis started', ru: 'Анализ файла начат' },
  fileAnalysisCompleted: { en: 'File analysis completed', ru: 'Анализ файла завершен' },
  
  // Status
  pending: { en: 'Pending', ru: 'Ожидает' },
  running: { en: 'Running', ru: 'Выполняется' },
  completed: { en: 'Completed', ru: 'Завершено' },
  failed: { en: 'Failed', ru: 'Не удался' }
};

const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  language,
  projectId,
  onFileUploaded,
  onFileAnalyzed
}) => {
  const t = (key: string) => translations[key]?.[language] || key;
  
  const [files, setFiles] = useKV<ProjectFile[]>(`file-manager-${projectId}`, []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [newTags, setNewTags] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState<Record<string, string>>({});

  // File size formatter
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file category from type
  const getFileCategory = (type: string): ProjectFile['category'] => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('text/') || type.includes('document') || type.includes('pdf')) return 'document';
    if (type.includes('json') || type.includes('csv') || type.includes('xml')) return 'data';
    if (type.startsWith('audio/') || type.startsWith('video/')) return 'media';
    return 'other';
  };

  // Get file icon
  const getFileIcon = (category: ProjectFile['category']) => {
    switch (category) {
      case 'document': return <FileText size={20} className="text-blue-500" />;
      case 'image': return <Image size={20} className="text-green-500" />;
      case 'data': return <Database size={20} className="text-purple-500" />;
      case 'media': return <CloudArrowUp size={20} className="text-red-500" />;
      default: return <FileX size={20} className="text-gray-500" />;
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: ProjectFile[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress((i / selectedFiles.length) * 100);

        // Read file content
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          
          if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
            reader.readAsText(file);
          } else {
            reader.readAsDataURL(file);
          }
        });

        const newFile: ProjectFile = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          category: getFileCategory(file.type),
          tags: [],
          analysisResults: [],
          [file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') ? 'content' : 'dataUrl']: content
        };

        uploadedFiles.push(newFile);
      }

      setFiles(current => [...(current || []), ...uploadedFiles]);
      uploadedFiles.forEach(file => onFileUploaded?.(file));
      
      toast.success(`${uploadedFiles.length} ${t('fileUploaded')}`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(t('fileUploadFailed'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [files, setFiles, onFileUploaded, t]);

  // Update file metadata
  const updateFileMetadata = (fileId: string, updates: Partial<ProjectFile>) => {
    setFiles(current => 
      (current || []).map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  // Add tags to file
  const addTagsToFile = (fileId: string) => {
    if (!newTags.trim()) return;
    
    const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
    updateFileMetadata(fileId, {
      tags: [...(selectedFile?.tags || []), ...tags]
    });
    setNewTags('');
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(current => (current || []).filter(file => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
    toast.success(t('removeFile'));
  };

  // Start file analysis
  const startFileAnalysis = async (file: ProjectFile, analysisType: FileAnalysisResult['analysisType']) => {
    const analysisId = `analysis-${Date.now()}`;
    setAnalysisStatus(current => ({ ...current, [analysisId]: 'running' }));

    const newAnalysis: FileAnalysisResult = {
      id: analysisId,
      fileId: file.id,
      agentId: 'ai-analysis-agent',
      agentName: 'AI Analysis Agent',
      analysisType,
      results: [],
      insights: [],
      timestamp: new Date().toISOString(),
      confidence: 0,
      status: 'running'
    };

    // Update file with pending analysis
    updateFileMetadata(file.id, {
      analysisResults: [...(file.analysisResults || []), newAnalysis]
    });

    toast.success(t('fileAnalysisStarted'));

    try {
      // Simulate AI analysis (replace with actual AI call)
      const mockAnalysis = await simulateFileAnalysis(file, analysisType);
      
      const completedAnalysis: FileAnalysisResult = {
        ...newAnalysis,
        results: mockAnalysis.results,
        insights: mockAnalysis.insights,
        confidence: mockAnalysis.confidence,
        status: 'completed'
      };

      // Update file with completed analysis
      updateFileMetadata(file.id, {
        analysisResults: (file.analysisResults || []).map(analysis =>
          analysis.id === analysisId ? completedAnalysis : analysis
        )
      });

      setAnalysisStatus(current => ({ ...current, [analysisId]: 'completed' }));
      onFileAnalyzed?.(completedAnalysis);
      toast.success(t('fileAnalysisCompleted'));

    } catch (error) {
      console.error('Analysis error:', error);
      
      updateFileMetadata(file.id, {
        analysisResults: (file.analysisResults || []).map(analysis =>
          analysis.id === analysisId ? { ...analysis, status: 'failed' } : analysis
        )
      });
      
      setAnalysisStatus(current => ({ ...current, [analysisId]: 'failed' }));
      toast.error('Analysis failed');
    }
  };

  // Simulate file analysis (replace with actual AI integration)
  const simulateFileAnalysis = async (
    file: ProjectFile, 
    analysisType: FileAnalysisResult['analysisType']
  ): Promise<{ results: string[], insights: string[], confidence: number }> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysisData = {
      content: {
        results: [
          'Document contains technical specifications',
          'Identified 15 key concepts and terms',
          'Text complexity level: Advanced',
          'Language: English with technical jargon'
        ],
        insights: [
          'Document appears to be technical documentation',
          'High information density detected',
          'Suitable for technical analysis workflows'
        ],
        confidence: 85
      },
      structure: {
        results: [
          'Well-structured document with clear sections',
          'Contains headers, lists, and code blocks',
          'Follows markdown formatting standards',
          'No structural inconsistencies found'
        ],
        insights: [
          'Document follows best practices for technical writing',
          'Structure supports easy navigation and comprehension',
          'Ready for automated processing'
        ],
        confidence: 92
      },
      security: {
        results: [
          'No sensitive information detected',
          'No embedded scripts or malicious content',
          'Safe for automated processing',
          'Complies with data protection standards'
        ],
        insights: [
          'File is safe for analysis and sharing',
          'No security risks identified',
          'Suitable for team collaboration'
        ],
        confidence: 88
      },
      metadata: {
        results: [
          `File size: ${formatFileSize(file.size)}`,
          `Upload date: ${new Date(file.uploadedAt).toLocaleDateString()}`,
          `File type: ${file.type}`,
          `Category: ${file.category}`
        ],
        insights: [
          'Metadata is complete and valid',
          'File properties support intended use case',
          'No metadata anomalies detected'
        ],
        confidence: 95
      }
    };

    return analysisData[analysisType] || analysisData.content;
  };

  // Download file
  const downloadFile = (file: ProjectFile) => {
    try {
      const content = file.content || file.dataUrl || '';
      const blob = new Blob([content], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('downloadFile'));
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowUp size={24} className="text-primary" />
            {t('fileManagement')}
          </CardTitle>
          <CardDescription>
            {t('dragDropFiles')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <CloudArrowUp size={48} className="mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">{t('selectFiles')}</p>
                <p className="text-sm text-muted-foreground">{t('dragDropFiles')}</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload"
                  accept=".txt,.md,.json,.csv,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
                <label htmlFor="file-upload">
                  <Button asChild disabled={isUploading}>
                    <span className="cursor-pointer">
                      <Upload size={16} className="mr-2" />
                      {t('selectFiles')}
                    </span>
                  </Button>
                </label>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {t('supportedFormats')}: TXT, MD, JSON, CSV, PDF, DOC, DOCX, JPG, PNG, GIF
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading files...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={24} className="text-primary" />
            {t('fileLibrary')}
          </CardTitle>
          <CardDescription>
            {(files || []).length} {(files || []).length === 1 ? 'file' : 'files'} uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!files || files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileX size={48} className="mx-auto mb-4" />
              <p>{t('noFilesUploaded')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {files.map(file => (
                <Card key={file.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedFile(file)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.category)}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {t(file.category)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{t(file.category)}</Badge>
                    </div>
                    
                    {file.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                    
                    {file.tags.length > 0 && (
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {file.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{file.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        {file.analysisResults && file.analysisResults.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Brain size={12} />
                            <span>{file.analysisResults.filter(a => a.status === 'completed').length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Details Modal (Simplified as expanded section) */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getFileIcon(selectedFile.category)}
                {selectedFile.name}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{t('fileSize')}</Label>
                <p className="text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
              <div>
                <Label>{t('uploadedAt')}</Label>
                <p className="text-sm">{new Date(selectedFile.uploadedAt).toLocaleString()}</p>
              </div>
              <div>
                <Label>{t('fileType')}</Label>
                <p className="text-sm">{selectedFile.type}</p>
              </div>
              <div>
                <Label>{t('fileCategory')}</Label>
                <Badge variant="secondary">{t(selectedFile.category)}</Badge>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">{t('fileDescription')}</Label>
                <Textarea
                  id="description"
                  value={selectedFile.description || ''}
                  onChange={(e) => updateFileMetadata(selectedFile.id, { description: e.target.value })}
                  placeholder="Add description..."
                  rows={3}
                />
              </div>

              <div>
                <Label>{t('fileTags')}</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {selectedFile.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => {
                          const newTags = selectedFile.tags.filter(t => t !== tag);
                          updateFileMetadata(selectedFile.id, { tags: newTags });
                        }}
                        className="ml-1 hover:bg-destructive/20"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder={t('addTags')}
                    onKeyPress={(e) => e.key === 'Enter' && addTagsToFile(selectedFile.id)}
                  />
                  <Button onClick={() => addTagsToFile(selectedFile.id)} disabled={!newTags.trim()}>
                    <Tag size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Analysis Section */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Brain size={20} />
                {t('fileAnalysis')}
              </h4>
              
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startFileAnalysis(selectedFile, 'content')}
                  disabled={analysisStatus[`${selectedFile.id}-content`] === 'running'}
                >
                  <FileText size={16} className="mr-2" />
                  {t('contentAnalysis')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startFileAnalysis(selectedFile, 'structure')}
                  disabled={analysisStatus[`${selectedFile.id}-structure`] === 'running'}
                >
                  <Database size={16} className="mr-2" />
                  {t('structureAnalysis')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startFileAnalysis(selectedFile, 'security')}
                  disabled={analysisStatus[`${selectedFile.id}-security`] === 'running'}
                >
                  <Shield size={16} className="mr-2" />
                  {t('securityAnalysis')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startFileAnalysis(selectedFile, 'metadata')}
                  disabled={analysisStatus[`${selectedFile.id}-metadata`] === 'running'}
                >
                  <Clock size={16} className="mr-2" />
                  {t('metadataAnalysis')}
                </Button>
              </div>

              {/* Analysis Results */}
              {selectedFile.analysisResults && selectedFile.analysisResults.length > 0 && (
                <div className="space-y-4">
                  <h5 className="font-medium">{t('analysisResults')}</h5>
                  {selectedFile.analysisResults.map(analysis => (
                    <Card key={analysis.id} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              analysis.status === 'completed' ? 'default' :
                              analysis.status === 'running' ? 'secondary' :
                              analysis.status === 'failed' ? 'destructive' : 'outline'
                            }>
                              {t(analysis.status)}
                            </Badge>
                            <span className="text-sm font-medium">{t(analysis.analysisType)}</span>
                          </div>
                          {analysis.status === 'completed' && (
                            <Badge variant="outline">
                              {t('confidence')}: {analysis.confidence}%
                            </Badge>
                          )}
                        </div>
                        
                        {analysis.status === 'completed' && (
                          <div className="space-y-3">
                            {analysis.results.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Results:</p>
                                <ul className="space-y-1">
                                  {analysis.results.map((result, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                      <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{result}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {analysis.insights.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Insights:</p>
                                <ul className="space-y-1">
                                  {analysis.insights.map((insight, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                      <Brain size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                      <span>{insight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {analysis.status === 'running' && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            Analyzing...
                          </div>
                        )}
                        
                        {analysis.status === 'failed' && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <Warning size={14} />
                            Analysis failed
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadFile(selectedFile)}>
                <Download size={16} className="mr-2" />
                {t('downloadFile')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Eye size={16} className="mr-2" />
                {t('previewFile')}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => removeFile(selectedFile.id)}>
                <Trash size={16} className="mr-2" />
                {t('removeFile')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadManager;
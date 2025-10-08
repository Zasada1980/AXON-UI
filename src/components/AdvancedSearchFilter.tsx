import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
// DatePicker component not available in current setup
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  MagnifyingGlass,
  Funnel,
  FloppyDisk,
  Trash,
  Download,
  Star,
  Calendar,
  Tag,
  SortAscending,
  SortDescending,
  Eye,
  FileText,
  Database,
  Graph,
  Robot,
  Users,
  Shield,
  Target,
  Brain,
  Plus,
  X,
  ArrowRight,
  CheckCircle,
  Bookmark
} from '@phosphor-icons/react';


interface AdvancedSearchFilterProps {
  language: 'en' | 'ru';
  projectId: string;
  onSearchResults: (results: SearchResult[]) => void;
  onFilterSaved: (filter: SavedFilter) => void;
}

interface SearchFilter {
  query: string;
  categories: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  contentTypes: string[];
  tags: string[];
  complexityRange: [number, number];
  completionRange: [number, number];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  semanticSearch: boolean;
  includeInsights: boolean;
  includeComments: boolean;
}

interface SearchResult {
  id: string;
  type: 'dimension' | 'ikr' | 'audit' | 'chat' | 'file' | 'insight';
  title: string;
  content: string;
  module: string;
  relevanceScore: number;
  matchedTerms: string[];
  lastModified: string;
  tags: string[];
  metadata: any;
}

interface SavedFilter {
  id: string;
  name: string;
  description: string;
  filter: SearchFilter;
  createdAt: string;
  lastUsed: string;
  useCount: number;
  isPublic: boolean;
}

interface AdvancedQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  parameters: {
    [key: string]: any;
  };
  category: 'analysis' | 'insights' | 'patterns' | 'validation';
}

const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  language,
  projectId,
  onSearchResults,
  onFilterSaved
}) => {
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({
    query: '',
    categories: [],
    dateRange: {},
    contentTypes: ['all'],
    tags: [],
    complexityRange: [0, 100],
    completionRange: [0, 100],
    sortBy: 'relevance',
    sortOrder: 'desc',
    semanticSearch: true,
    includeInsights: true,
    includeComments: false
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterDescription, setNewFilterDescription] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Predefined advanced queries
  const advancedQueries: AdvancedQuery[] = [
    {
      id: 'find-gaps',
      name: language === 'ru' ? 'Найти пробелы в анализе' : 'Find Analysis Gaps',
      description: language === 'ru' ? 'Выявляет области с недостаточным анализом' : 'Identifies areas with insufficient analysis',
      query: 'Find dimensions or sections with low completion rates and suggest improvements',
      parameters: { minCompletion: 30, includeEmptyFields: true },
      category: 'analysis'
    },
    {
      id: 'conflict-detection',
      name: language === 'ru' ? 'Обнаружение противоречий' : 'Conflict Detection',
      description: language === 'ru' ? 'Находит противоречивые утверждения в анализе' : 'Finds contradictory statements in analysis',
      query: 'Identify conflicting information or contradictory statements across different sections',
      parameters: { sensitivity: 0.7, includeInsights: true },
      category: 'validation'
    },
    {
      id: 'pattern-discovery',
      name: language === 'ru' ? 'Обнаружение паттернов' : 'Pattern Discovery',
      description: language === 'ru' ? 'Выявляет скрытые паттерны и связи' : 'Discovers hidden patterns and connections',
      query: 'Find recurring themes, patterns, and hidden connections across all analysis data',
      parameters: { depth: 'deep', includeMetadata: true },
      category: 'patterns'
    },
    {
      id: 'insight-synthesis',
      name: language === 'ru' ? 'Синтез инсайтов' : 'Insight Synthesis',
      description: language === 'ru' ? 'Объединяет разрозненные инсайты в общую картину' : 'Combines scattered insights into a comprehensive view',
      query: 'Synthesize individual insights into higher-level strategic observations',
      parameters: { synthesisLevel: 'strategic', includeRecommendations: true },
      category: 'insights'
    }
  ];

  // Available content categories
  const contentCategories = [
    { id: 'kipling', name: language === 'ru' ? 'Протокол Киплинга' : 'Kipling Protocol', icon: <Users size={16} /> },
    { id: 'ikr', name: language === 'ru' ? 'Директива IKR' : 'IKR Directive', icon: <Target size={16} /> },
    { id: 'audit', name: language === 'ru' ? 'Результаты аудита' : 'Audit Results', icon: <Shield size={16} /> },
    { id: 'chat', name: language === 'ru' ? 'История чата' : 'Chat History', icon: <Robot size={16} /> },
    { id: 'insights', name: language === 'ru' ? 'Инсайты' : 'Insights', icon: <Brain size={16} /> },
    { id: 'files', name: language === 'ru' ? 'Файлы' : 'Files', icon: <FileText size={16} /> }
  ];

  // Content types
  const contentTypes = [
    { id: 'all', name: language === 'ru' ? 'Всё содержимое' : 'All Content' },
    { id: 'text', name: language === 'ru' ? 'Текст' : 'Text' },
    { id: 'structured', name: language === 'ru' ? 'Структурированные данные' : 'Structured Data' },
    { id: 'metadata', name: language === 'ru' ? 'Метаданные' : 'Metadata' },
    { id: 'comments', name: language === 'ru' ? 'Комментарии' : 'Comments' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'relevance', name: language === 'ru' ? 'Релевантность' : 'Relevance' },
    { id: 'date', name: language === 'ru' ? 'Дата изменения' : 'Last Modified' },
    { id: 'completion', name: language === 'ru' ? 'Завершенность' : 'Completion' },
    { id: 'importance', name: language === 'ru' ? 'Важность' : 'Importance' },
    { id: 'alphabetical', name: language === 'ru' ? 'По алфавиту' : 'Alphabetical' }
  ];

  // Mock data for demonstration
  const mockSearchResults: SearchResult[] = [
    {
      id: 'result-1',
      type: 'dimension',
      title: language === 'ru' ? 'Измерение "Кто"' : 'Who Dimension',
      content: language === 'ru' ? 'Основные участники включают заказчика, исполнительную систему и когнитивные модули...' : 'Primary participants include the client, executive system, and cognitive modules...',
      module: 'kipling',
      relevanceScore: 0.95,
      matchedTerms: ['участники', 'система', 'модули'],
      lastModified: '2024-01-15T10:30:00Z',
      tags: ['stakeholders', 'system', 'analysis'],
      metadata: { completeness: 85, priority: 'high' }
    },
    {
      id: 'result-2',
      type: 'ikr',
      title: language === 'ru' ? 'Сбор разведданных' : 'Intelligence Collection',
      content: language === 'ru' ? 'Информация собирается путем анализа файлов в репозитории...' : 'Information is collected by analyzing files in the repository...',
      module: 'ikr',
      relevanceScore: 0.87,
      matchedTerms: ['сбор', 'информация', 'анализ'],
      lastModified: '2024-01-14T15:45:00Z',
      tags: ['intelligence', 'data', 'collection'],
      metadata: { completeness: 70, priority: 'medium' }
    }
  ];

  // Load saved filters and custom tags
  useEffect(() => {
    // In a real implementation, load from localStorage or API
    const savedData = localStorage.getItem(`search-filters-${projectId}`);
    if (savedData) {
      setSavedFilters(JSON.parse(savedData));
    }

    const savedTags = localStorage.getItem(`custom-tags-${projectId}`);
    if (savedTags) {
      setCustomTags(JSON.parse(savedTags));
    }
  }, [projectId]);

  // Perform search
  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      // For demonstration, use mock data
      // In real implementation, this would call the actual search API
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock results based on current filter
  const filteredResults = mockSearchResults.filter(result => {
        // Apply category filter
        if (searchFilter.categories.length > 0 && !searchFilter.categories.includes(result.module)) {
          return false;
        }
        
        // Apply completion range filter
        const completion = result.metadata?.completeness || 0;
        if (completion < searchFilter.completionRange[0] || completion > searchFilter.completionRange[1]) {
          return false;
        }
        
        // Apply text search
        if (searchFilter.query) {
          const queryLower = searchFilter.query.toLowerCase();
          const titleMatch = result.title.toLowerCase().includes(queryLower);
          const contentMatch = result.content.toLowerCase().includes(queryLower);
          const tagMatch = result.tags.some(tag => tag.toLowerCase().includes(queryLower));
          
          if (!titleMatch && !contentMatch && !tagMatch) {
            return false;
          }
        }
        
        return true;
      });
      
      // Apply sorting
      filteredResults.sort((a, b) => {
        let comparison = 0;
        
        switch (searchFilter.sortBy) {
          case 'relevance':
            comparison = b.relevanceScore - a.relevanceScore;
            break;
          case 'date':
            comparison = new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
            break;
          case 'completion':
            comparison = (b.metadata?.completeness || 0) - (a.metadata?.completeness || 0);
            break;
          case 'alphabetical':
            comparison = a.title.localeCompare(b.title);
            break;
          default:
            comparison = b.relevanceScore - a.relevanceScore;
        }
        
        return searchFilter.sortOrder === 'asc' ? -comparison : comparison;
      });
      
      setSearchResults(filteredResults);
      onSearchResults(filteredResults);
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Advanced semantic search using AI
  const performAdvancedQuery = async (query: AdvancedQuery) => {
    setIsSearching(true);
    
    try {
      const spark = (globalThis as any).spark;
      if (!spark) {
        throw new Error('Spark API not available');
      }

      const prompt = spark.llmPrompt`Perform advanced search analysis on project data:

Query: ${query.query}
Parameters: ${JSON.stringify(query.parameters)}
Category: ${query.category}

Based on the mock project data and search context, provide structured search results including:
1. Relevant content matches
2. Pattern analysis
3. Gap identification
4. Strategic insights
5. Recommended actions

Return as JSON with "results" array containing search result objects.`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const aiResults = JSON.parse(response);
      
      // Convert AI results to SearchResult format
      const convertedResults: SearchResult[] = (aiResults.results || []).map((result: any, index: number) => ({
        id: `ai-result-${index}`,
        type: 'insight',
        title: result.title || `AI Insight ${index + 1}`,
        content: result.content || result.description || '',
        module: 'ai-analysis',
        relevanceScore: result.relevance || 0.8,
        matchedTerms: result.terms || [],
        lastModified: new Date().toISOString(),
        tags: result.tags || ['ai-generated', query.category],
        metadata: { 
          aiGenerated: true, 
          queryType: query.category,
          confidence: result.confidence || 0.8 
        }
      }));
      
      setSearchResults(convertedResults);
      onSearchResults(convertedResults);
      
    } catch (error) {
      console.error('Advanced query error:', error);
      // Fallback to regular search
      await performSearch();
    } finally {
      setIsSearching(false);
    }
  };

  // Save current filter
  const saveFilter = () => {
    if (!newFilterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName.trim(),
      description: newFilterDescription.trim(),
      filter: { ...searchFilter },
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      useCount: 0,
      isPublic: false
    };
    
    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem(`search-filters-${projectId}`, JSON.stringify(updatedFilters));
    
    onFilterSaved(newFilter);
    setShowSaveDialog(false);
    setNewFilterName('');
    setNewFilterDescription('');
  };

  // Load saved filter
  const loadFilter = (filter: SavedFilter) => {
    setSearchFilter(filter.filter);
    
    // Update usage statistics
    const updatedFilters = savedFilters.map(f => 
      f.id === filter.id 
        ? { ...f, lastUsed: new Date().toISOString(), useCount: f.useCount + 1 }
        : f
    );
    setSavedFilters(updatedFilters);
    localStorage.setItem(`search-filters-${projectId}`, JSON.stringify(updatedFilters));
  };

  // Add custom tag
  const addCustomTag = () => {
    if (!newTag.trim() || customTags.includes(newTag.trim())) return;
    
    const updatedTags = [...customTags, newTag.trim()];
    setCustomTags(updatedTags);
    localStorage.setItem(`custom-tags-${projectId}`, JSON.stringify(updatedTags));
    setNewTag('');
  };

  // Export search results
  const exportResults = () => {
    const exportData = {
      filter: searchFilter,
      results: searchResults,
      timestamp: new Date().toISOString(),
      projectId
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'dimension': return <Users size={16} />;
      case 'ikr': return <Target size={16} />;
      case 'audit': return <Shield size={16} />;
      case 'chat': return <Robot size={16} />;
      case 'insight': return <Brain size={16} />;
      case 'file': return <FileText size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={24} />
            {language === 'ru' ? 'Продвинутый поиск и фильтрация' : 'Advanced Search & Filtering'}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Мощные инструменты поиска с семантическим анализом и ИИ-ассистентом'
              : 'Powerful search tools with semantic analysis and AI assistance'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={language === 'ru' ? 'Введите поисковый запрос...' : 'Enter search query...'}
                value={searchFilter.query}
                onChange={(e) => setSearchFilter({ ...searchFilter, query: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              />
            </div>
            <Button onClick={performSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <MagnifyingGlass size={16} />
              )}
              {language === 'ru' ? 'Поиск' : 'Search'}
            </Button>
            <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Funnel size={16} />
              {language === 'ru' ? 'Фильтры' : 'Filters'}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <Tabs defaultValue="filters" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="filters">
                      {language === 'ru' ? 'Фильтры' : 'Filters'}
                    </TabsTrigger>
                    <TabsTrigger value="ai-queries">
                      {language === 'ru' ? 'ИИ Запросы' : 'AI Queries'}
                    </TabsTrigger>
                    <TabsTrigger value="saved">
                      {language === 'ru' ? 'Сохраненные' : 'Saved'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="filters" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Categories */}
                      <div>
                        <Label>{language === 'ru' ? 'Категории контента' : 'Content Categories'}</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {contentCategories.map(category => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={category.id}
                                checked={searchFilter.categories.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSearchFilter({
                                      ...searchFilter,
                                      categories: [...searchFilter.categories, category.id]
                                    });
                                  } else {
                                    setSearchFilter({
                                      ...searchFilter,
                                      categories: searchFilter.categories.filter(c => c !== category.id)
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={category.id} className="flex items-center gap-1 text-sm">
                                {category.icon}
                                {category.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Content Types */}
                      <div>
                        <Label>{language === 'ru' ? 'Тип содержимого' : 'Content Type'}</Label>
                        <Select
                          value={searchFilter.contentTypes[0] || 'all'}
                          onValueChange={(value) => setSearchFilter({ ...searchFilter, contentTypes: [value] })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contentTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Completion Range */}
                      <div>
                        <Label>
                          {language === 'ru' ? 'Уровень завершенности' : 'Completion Level'}: {searchFilter.completionRange[0]}% - {searchFilter.completionRange[1]}%
                        </Label>
                        <Slider
                          value={searchFilter.completionRange}
                          onValueChange={(value) => setSearchFilter({ ...searchFilter, completionRange: value as [number, number] })}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      {/* Sort Options */}
                      <div>
                        <Label>{language === 'ru' ? 'Сортировка' : 'Sort By'}</Label>
                        <div className="flex gap-2 mt-2">
                          <Select
                            value={searchFilter.sortBy}
                            onValueChange={(value) => setSearchFilter({ ...searchFilter, sortBy: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sortOptions.map(option => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchFilter({ 
                              ...searchFilter, 
                              sortOrder: searchFilter.sortOrder === 'asc' ? 'desc' : 'asc' 
                            })}
                          >
                            {searchFilter.sortOrder === 'asc' ? <SortAscending size={16} /> : <SortDescending size={16} />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="semantic-search"
                          checked={searchFilter.semanticSearch}
                          onCheckedChange={(checked) => setSearchFilter({ ...searchFilter, semanticSearch: !!checked })}
                        />
                        <Label htmlFor="semantic-search">
                          {language === 'ru' ? 'Семантический поиск' : 'Semantic Search'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-insights"
                          checked={searchFilter.includeInsights}
                          onCheckedChange={(checked) => setSearchFilter({ ...searchFilter, includeInsights: !!checked })}
                        />
                        <Label htmlFor="include-insights">
                          {language === 'ru' ? 'Включить инсайты' : 'Include Insights'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-comments"
                          checked={searchFilter.includeComments}
                          onCheckedChange={(checked) => setSearchFilter({ ...searchFilter, includeComments: !!checked })}
                        />
                        <Label htmlFor="include-comments">
                          {language === 'ru' ? 'Включить комментарии' : 'Include Comments'}
                        </Label>
                      </div>
                    </div>

                    {/* Custom Tags */}
                    <Separator />
                    <div>
                      <Label>{language === 'ru' ? 'Пользовательские теги' : 'Custom Tags'}</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder={language === 'ru' ? 'Добавить тег...' : 'Add tag...'}
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                        />
                        <Button size="sm" onClick={addCustomTag}>
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => {
                            if (!searchFilter.tags.includes(tag)) {
                              setSearchFilter({ ...searchFilter, tags: [...searchFilter.tags, tag] });
                            }
                          }}>
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                        <FloppyDisk size={16} className="mr-2" />
                        {language === 'ru' ? 'Сохранить фильтр' : 'Save Filter'}
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSearchFilter({
                          query: '',
                          categories: [],
                          dateRange: {},
                          contentTypes: ['all'],
                          tags: [],
                          complexityRange: [0, 100],
                          completionRange: [0, 100],
                          sortBy: 'relevance',
                          sortOrder: 'desc',
                          semanticSearch: true,
                          includeInsights: true,
                          includeComments: false
                        })}>
                          <Trash size={16} className="mr-2" />
                          {language === 'ru' ? 'Сбросить' : 'Reset'}
                        </Button>
                        <Button onClick={performSearch} disabled={isSearching}>
                          <MagnifyingGlass size={16} className="mr-2" />
                          {language === 'ru' ? 'Применить' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai-queries" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {advancedQueries.map(query => (
                        <Card key={query.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{query.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{query.description}</p>
                                <Badge variant="outline" className="text-xs">
                                  {query.category}
                                </Badge>
                              </div>
                              <Button size="sm" onClick={() => performAdvancedQuery(query)} disabled={isSearching}>
                                <Brain size={16} className="mr-1" />
                                {language === 'ru' ? 'Выполнить' : 'Execute'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="saved" className="space-y-4 mt-4">
                    {savedFilters.length === 0 ? (
                      <div className="text-center py-8">
                        <Bookmark size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">
                          {language === 'ru' ? 'Нет сохраненных фильтров' : 'No Saved Filters'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ru' 
                            ? 'Создайте и сохраните фильтры для быстрого доступа'
                            : 'Create and save filters for quick access'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedFilters.map(filter => (
                          <Card key={filter.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium mb-1">{filter.name}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{filter.description}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {language === 'ru' ? 'Использований:' : 'Used:'} {filter.useCount}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {language === 'ru' ? 'Последний раз:' : 'Last used:'} {new Date(filter.lastUsed).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => loadFilter(filter)}>
                                  <ArrowRight size={16} className="mr-1" />
                                  {language === 'ru' ? 'Загрузить' : 'Load'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database size={20} />
                  {language === 'ru' ? 'Результаты поиска' : 'Search Results'}
                </CardTitle>
                <CardDescription>
                  {language === 'ru' ? 'Найдено' : 'Found'} {searchResults.length} {language === 'ru' ? 'результатов' : 'results'}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={exportResults}>
                <Download size={16} className="mr-2" />
                {language === 'ru' ? 'Экспорт' : 'Export'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {searchResults.map(result => (
                  <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getResultIcon(result.type)}
                            <h4 className="font-medium">{result.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {result.module}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(result.relevanceScore * 100)}% {language === 'ru' ? 'релевантность' : 'relevance'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {result.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar size={12} />
                            <span>{new Date(result.lastModified).toLocaleDateString()}</span>
                            {result.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex gap-1">
                                  {result.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {result.tags.length > 3 && (
                                    <span className="text-xs">+{result.tags.length - 3}</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setSelectedResult(result)}>
                          <Eye size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Save Filter Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ru' ? 'Сохранить фильтр поиска' : 'Save Search Filter'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ru' 
                ? 'Сохраните текущие настройки фильтра для быстрого доступа в будущем'
                : 'Save current filter settings for quick access in the future'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-name">
                {language === 'ru' ? 'Название фильтра' : 'Filter Name'}
              </Label>
              <Input
                id="filter-name"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                placeholder={language === 'ru' ? 'Введите название...' : 'Enter name...'}
              />
            </div>
            <div>
              <Label htmlFor="filter-description">
                {language === 'ru' ? 'Описание' : 'Description'}
              </Label>
              <Textarea
                id="filter-description"
                value={newFilterDescription}
                onChange={(e) => setNewFilterDescription(e.target.value)}
                placeholder={language === 'ru' ? 'Опишите назначение фильтра...' : 'Describe the filter purpose...'}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button onClick={saveFilter} disabled={!newFilterName.trim()}>
                <FloppyDisk size={16} className="mr-2" />
                {language === 'ru' ? 'Сохранить' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Detail Dialog */}
      {selectedResult && (
        <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getResultIcon(selectedResult.type)}
                {selectedResult.title}
              </DialogTitle>
              <DialogDescription>
                {selectedResult.module} • {Math.round(selectedResult.relevanceScore * 100)}% {language === 'ru' ? 'релевантность' : 'relevance'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === 'ru' ? 'Содержимое' : 'Content'}</Label>
                <div className="bg-muted/50 p-4 rounded-lg mt-2">
                  <p className="text-sm">{selectedResult.content}</p>
                </div>
              </div>
              
              {selectedResult.matchedTerms.length > 0 && (
                <div>
                  <Label>{language === 'ru' ? 'Найденные термины' : 'Matched Terms'}</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedResult.matchedTerms.map(term => (
                      <Badge key={term} variant="secondary" className="text-xs">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label>{language === 'ru' ? 'Теги' : 'Tags'}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedResult.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setSelectedResult(null)}>
                  {language === 'ru' ? 'Закрыть' : 'Close'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdvancedSearchFilter;
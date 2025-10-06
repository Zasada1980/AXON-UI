import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  MagnifyingGlass as Search, 
  Funnel as Filter, 
  ArrowUp as SortAsc, 
  ArrowDown as SortDesc, 
  Calendar,
  Tag,
  FileText,
  Users,
  Target,
  Brain,
  Star,
  Archive,
  X,
  Plus,
  TrendUp as TrendingUp,
  Clock,
  CheckCircle
} from '@phosphor-icons/react';

interface SearchFilter {
  id: string;
  name: string;
  query: string;
  filters: {
    dateRange?: {
      start?: string;
      end?: string;
    };
    tags?: string[];
    modules?: string[];
    status?: string[];
    priority?: string[];
    contentType?: string[];
    agents?: string[];
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  createdAt: string;
  lastUsed: string;
  usageCount: number;
}

interface SearchResult {
  id: string;
  type: 'project' | 'dimension' | 'audit' | 'debate' | 'task' | 'file' | 'memory';
  title: string;
  content: string;
  tags: string[];
  module: string;
  priority?: string;
  status?: string;
  createdAt: string;
  lastModified: string;
  relevanceScore: number;
  highlights: string[];
  metadata: Record<string, any>;
}

interface AdvancedSearchFilterProps {
  language: string;
  projectId: string;
  onSearchResults: (results: SearchResult[]) => void;
  onFilterSaved: (filter: SearchFilter) => void;
}

const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  language,
  projectId,
  onSearchResults,
  onFilterSaved
}) => {
  const [savedFilters, setSavedFilters] = useKV<SearchFilter[]>(`search-filters-${projectId}`, []);
  const [currentFilter, setCurrentFilter] = useState<Partial<SearchFilter>>({
    query: '',
    filters: {},
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [recentSearches, setRecentSearches] = useKV<string[]>(`recent-searches-${projectId}`, []);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      search: { en: 'Search', ru: 'Поиск' },
      advancedSearch: { en: 'Advanced Search', ru: 'Расширенный поиск' },
      searchPlaceholder: { en: 'Search across all project data...', ru: 'Поиск по всем данным проекта...' },
      filters: { en: 'Filters', ru: 'Фильтры' },
      dateRange: { en: 'Date Range', ru: 'Диапазон дат' },
      tags: { en: 'Tags', ru: 'Теги' },
      modules: { en: 'Modules', ru: 'Модули' },
      status: { en: 'Status', ru: 'Статус' },
      priority: { en: 'Priority', ru: 'Приоритет' },
      sortBy: { en: 'Sort By', ru: 'Сортировать по' },
      relevance: { en: 'Relevance', ru: 'Релевантность' },
      date: { en: 'Date', ru: 'Дате' },
      title: { en: 'Title', ru: 'Названию' },
      saveFilter: { en: 'Save Filter', ru: 'Сохранить фильтр' },
      savedFilters: { en: 'Saved Filters', ru: 'Сохранённые фильтры' },
      recentSearches: { en: 'Recent Searches', ru: 'Недавние поиски' },
      noResults: { en: 'No results found', ru: 'Результаты не найдены' },
      searchResults: { en: 'Search Results', ru: 'Результаты поиска' },
      filterName: { en: 'Filter Name', ru: 'Название фильтра' },
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      clear: { en: 'Clear', ru: 'Очистить' },
      apply: { en: 'Apply', ru: 'Применить' },
      export: { en: 'Export Results', ru: 'Экспорт результатов' }
    };
    return translations[key]?.[language] || key;
  };

  const performSearch = async () => {
    if (!currentFilter.query && !Object.keys(currentFilter.filters || {}).length) {
      return;
    }

    setIsSearching(true);

    try {
      // Simulate advanced search with AI-powered relevance scoring
      const prompt = `Perform an advanced search across project data with the following parameters:
Query: "${currentFilter.query}"
Filters: ${JSON.stringify(currentFilter.filters)}
Sort: ${currentFilter.sortBy} ${currentFilter.sortOrder}

Return comprehensive search results as JSON with structure:
{
  "results": [
    {
      "id": "result-id",
      "type": "project|dimension|audit|debate|task|file|memory",
      "title": "Result title",
      "content": "Content excerpt",
      "tags": ["tag1", "tag2"],
      "module": "module-name",
      "priority": "high|medium|low",
      "status": "status-value",
      "createdAt": "ISO-date",
      "lastModified": "ISO-date",
      "relevanceScore": 0-100,
      "highlights": ["highlighted", "text", "snippets"],
      "metadata": {}
    }
  ]
}`;

      const response = await (window as any).spark.llm(
        (window as any).spark.llmPrompt`${prompt}`,
        'gpt-4o-mini',
        true
      );

      const searchData = JSON.parse(response);
      const results = searchData.results || [];

      setSearchResults(results);
      onSearchResults(results);

      // Update recent searches
      if (currentFilter.query) {
        const updated = [currentFilter.query, ...(recentSearches || []).filter(s => s !== currentFilter.query)]
          .slice(0, 10);
        setRecentSearches(updated);
      }

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SearchFilter = {
      id: `filter-${Date.now()}`,
      name: filterName,
      query: currentFilter.query || '',
      filters: currentFilter.filters || {},
      sortBy: currentFilter.sortBy || 'relevance',
      sortOrder: currentFilter.sortOrder || 'desc',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 1
    };

    setSavedFilters(current => [...(current || []), newFilter]);
    onFilterSaved(newFilter);
    setShowSaveDialog(false);
    setFilterName('');
  };

  const loadSavedFilter = (filter: SearchFilter) => {
    setCurrentFilter({
      query: filter.query,
      filters: filter.filters,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder
    });

    // Update usage stats
    setSavedFilters(current => 
      (current || []).map(f => 
        f.id === filter.id 
          ? { ...f, lastUsed: new Date().toISOString(), usageCount: f.usageCount + 1 }
          : f
      )
    );
  };

  const clearFilters = () => {
    setCurrentFilter({
      query: '',
      filters: {},
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setSearchResults([]);
  };

  const exportResults = () => {
    const exportData = {
      query: currentFilter.query,
      filters: currentFilter.filters,
      results: searchResults,
      exportedAt: new Date().toISOString(),
      totalResults: searchResults.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={24} className="text-primary" />
            {t('advancedSearch')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Мощный поиск с фильтрацией и ИИ-ранжированием'
              : 'Powerful search with filtering and AI-powered ranking'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                value={currentFilter.query || ''}
                onChange={(e) => setCurrentFilter(prev => ({ ...prev, query: e.target.value }))}
                placeholder={t('searchPlaceholder')}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              />
            </div>
            <Button onClick={performSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Search size={16} />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter size={16} className="mr-2" />
              {t('filters')}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label>{t('dateRange')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={currentFilter.filters?.dateRange?.start || ''}
                      onChange={(e) => setCurrentFilter(prev => ({
                        ...prev,
                        filters: {
                          ...prev.filters,
                          dateRange: {
                            ...prev.filters?.dateRange,
                            start: e.target.value
                          }
                        }
                      }))}
                    />
                    <span>-</span>
                    <Input
                      type="date"
                      value={currentFilter.filters?.dateRange?.end || ''}
                      onChange={(e) => setCurrentFilter(prev => ({
                        ...prev,
                        filters: {
                          ...prev.filters,
                          dateRange: {
                            ...prev.filters?.dateRange,
                            end: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                </div>

                {/* Modules */}
                <div className="space-y-2">
                  <Label>{t('modules')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select modules..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="kipling">Kipling</SelectItem>
                      <SelectItem value="ikr">IKR</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="debate">Debate</SelectItem>
                      <SelectItem value="executor">Executor</SelectItem>
                      <SelectItem value="memory">Memory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>{t('priority')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>{t('sortBy')}:</Label>
                  <Select
                    value={currentFilter.sortBy}
                    onValueChange={(value) => setCurrentFilter(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">{t('relevance')}</SelectItem>
                      <SelectItem value="date">{t('date')}</SelectItem>
                      <SelectItem value="title">{t('title')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFilter(prev => ({
                    ...prev,
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                  }))}
                >
                  {currentFilter.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X size={16} className="mr-2" />
                    {t('clear')}
                  </Button>
                  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Archive size={16} className="mr-2" />
                        {t('saveFilter')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('saveFilter')}</DialogTitle>
                        <DialogDescription>
                          {language === 'ru' 
                            ? 'Сохраните текущие настройки поиска для повторного использования'
                            : 'Save current search settings for reuse'
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="filter-name">{t('filterName')}</Label>
                          <Input
                            id="filter-name"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Enter filter name..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            {t('cancel')}
                          </Button>
                          <Button onClick={saveCurrentFilter} disabled={!filterName.trim()}>
                            {t('save')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button onClick={performSearch} disabled={isSearching}>
                  {t('apply')}
                </Button>
              </div>
            </div>
          )}

          {/* Quick Access */}
          <div className="flex items-center gap-4">
            {/* Recent Searches */}
            {(recentSearches || []).length > 0 && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <ScrollArea className="w-64 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {(recentSearches || []).slice(0, 3).map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentFilter(prev => ({ ...prev, query: search }))}
                        className="text-xs"
                      >
                        {search.substring(0, 20)}...
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Saved Filters */}
            {(savedFilters || []).length > 0 && (
              <div className="flex items-center gap-2">
                <Archive size={16} className="text-muted-foreground" />
                <ScrollArea className="w-64 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {(savedFilters || []).slice(0, 3).map((filter) => (
                      <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        onClick={() => loadSavedFilter(filter)}
                        className="text-xs"
                      >
                        {filter.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                {t('searchResults')} ({searchResults.length})
              </CardTitle>
              <Button onClick={exportResults} variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                {t('export')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{result.type}</Badge>
                        <Badge variant="secondary">{result.module}</Badge>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500" />
                          <span className="text-xs">{result.relevanceScore}%</span>
                        </div>
                      </div>
                      {result.priority && (
                        <Badge variant={result.priority === 'high' ? 'destructive' : 'outline'}>
                          {result.priority}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{result.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.content.substring(0, 150)}...
                    </p>
                    {result.highlights.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        {result.highlights.map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(result.lastModified).toLocaleDateString()}</span>
                      {result.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag size={12} />
                          {result.tags.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!isSearching && searchResults.length === 0 && currentFilter.query && (
        <Card>
          <CardContent className="text-center py-12">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noResults')}</h3>
            <p className="text-muted-foreground">
              {language === 'ru' 
                ? 'Попробуйте изменить поисковый запрос или настройки фильтров'
                : 'Try adjusting your search query or filter settings'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearchFilter;
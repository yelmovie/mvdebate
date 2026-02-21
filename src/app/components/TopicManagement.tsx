import React, { useState, useEffect } from 'react';
import { apiCall } from '../../utils/supabase';
import { 
  ArrowLeft, Plus, Search, Sparkles, Trash2, 
  Edit, RotateCcw, X, Check, Loader2, Tag, BookOpen
} from 'lucide-react';
import { useAlert } from './AlertProvider';

interface Topic {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
  tags?: string[];
  createdAt?: string;
}

interface TopicManagementProps {
  onBack: () => void;
  classId: string;
  demoMode?: boolean;
}

export default function TopicManagement({ onBack, classId, demoMode = false }: TopicManagementProps) {
  const { showAlert } = useAlert();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine' | 'ai'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [deletedTopic, setDeletedTopic] = useState<Topic | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    filterTopics();
  }, [topics, searchQuery, filter]);

  async function loadTopics() {
    try {
      if (demoMode) {
        const mockTopics: Topic[] = [
          { 
            id: 'topic-1', 
            title: '학교에서 스마트폰 사용 허용', 
            description: '학생들의 학교 내 스마트폰 사용을 허용해야 하는가?',
            isAIGenerated: false,
            tags: ['학교', '기술'],
            createdAt: new Date().toISOString()
          },
          { 
            id: 'topic-2', 
            title: '교복 자율화', 
            description: '학교에서 교복을 자율화해야 하는가?',
            isAIGenerated: false,
            tags: ['학교', '자유'],
            createdAt: new Date().toISOString()
          },
          { 
            id: 'topic-3', 
            title: '온라인 수업의 효과', 
            description: '온라인 수업이 오프라인 수업보다 효과적인가?',
            isAIGenerated: true,
            tags: ['교육', '기술'],
            createdAt: new Date().toISOString()
          },
          { 
            id: 'topic-4', 
            title: '급식 메뉴 선택권', 
            description: '학생들에게 급식 메뉴를 선택할 권리를 줘야 하는가?',
            isAIGenerated: false,
            tags: ['학교', '인권'],
            createdAt: new Date().toISOString()
          },
          { 
            id: 'topic-5', 
            title: '숙제의 필요성', 
            description: '학생들에게 숙제는 반드시 필요한가?',
            isAIGenerated: true,
            tags: ['교육', '학습'],
            createdAt: new Date().toISOString()
          }
        ];
        setTopics(mockTopics);
        return;
      }
      
      const data = await apiCall(`/classes/${classId}/topics`);
      setTopics(data.topics);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  }

  function filterTopics() {
    let filtered = [...topics];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filter === 'mine') {
      filtered = filtered.filter(topic => !topic.isAIGenerated);
    } else if (filter === 'ai') {
      filtered = filtered.filter(topic => topic.isAIGenerated);
    }

    setFilteredTopics(filtered);
  }

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (demoMode) {
        const newTopic: Topic = {
          id: `topic-${Date.now()}`,
          title: newTopicTitle,
          description: newTopicDescription,
          isAIGenerated: false,
          tags: ['커스텀'],
          createdAt: new Date().toISOString()
        };
        setTopics([newTopic, ...topics]);
        setShowCreateModal(false);
        setNewTopicTitle('');
        setNewTopicDescription('');
        setLoading(false);
        return;
      }
      
      const data = await apiCall(`/classes/${classId}/topics`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTopicTitle,
          description: newTopicDescription
        }),
      });

      setTopics([data.topic, ...topics]);
      setShowCreateModal(false);
      setNewTopicTitle('');
      setNewTopicDescription('');
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAITopic(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);

    try {
      if (demoMode) {
        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const aiTopics: Topic[] = [
          {
            id: `topic-ai-${Date.now()}`,
            title: '환경 보호를 위한 일회용품 사용 금지',
            description: '환경 보호를 위해 학교에서 일회용품 사용을 전면 금지해야 하는가?',
            isAIGenerated: true,
            tags: ['환경', '정책'],
            createdAt: new Date().toISOString()
          }
        ];
        
        setTopics([...aiTopics, ...topics]);
        setShowAIModal(false);
        setAiPrompt('');
        setIsGenerating(false);
        return;
      }
      
      const data = await apiCall(`/classes/${classId}/topics/generate`, {
        method: 'POST',
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      setTopics([data.topic, ...topics]);
      setShowAIModal(false);
      setAiPrompt('');
    } catch (error: any) {
      showAlert(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  function initiateDelete(topic: Topic) {
    setTopicToDelete(topic);
    setShowDeleteModal(true);
  }

  async function handleDeleteTopic() {
    if (!topicToDelete) return;

    setShowDeleteModal(false);
    const deletedItem = topicToDelete;
    
    // Remove from list immediately
    setTopics(topics.filter(t => t.id !== deletedItem.id));
    setDeletedTopic(deletedItem);

    // Set up undo timer (3 seconds)
    const timer = setTimeout(() => {
      performDelete(deletedItem.id);
      setDeletedTopic(null);
    }, 3000);
    
    setUndoTimer(timer);
    setTopicToDelete(null);
  }

  async function performDelete(topicId: string) {
    if (demoMode) return;
    
    try {
      await apiCall(`/topics/${topicId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  }

  function handleUndo() {
    if (undoTimer) {
      clearTimeout(undoTimer);
    }
    
    if (deletedTopic) {
      setTopics([deletedTopic, ...topics]);
      setDeletedTopic(null);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-accent"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              돌아가기
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-text-primary mb-3 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-primary" />
              토론 주제 관리
            </h1>
            <p className="text-text-secondary text-lg">학생들이 토론할 주제를 추가하고 관리하세요</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex-1 sm:flex-none px-6 py-4 bg-gradient-accent text-white rounded-full font-bold shadow-medium hover:shadow-glow transition-all flex items-center justify-center gap-2 animate-pulse-subtle"
            >
              <Sparkles className="w-5 h-5 animate-spin-slow" />
              AI가 새로운 주제를 만들어줘요!
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-none px-6 py-4 bg-gradient-primary text-white rounded-full font-bold shadow-soft hover:shadow-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              직접 주제 추가
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="주제 검색..."
                className="w-full pl-14 pr-5 py-4 bg-white border-2 border-border rounded-full focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all shadow-soft text-text-primary placeholder:text-text-secondary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
                }`}
              >
                전체 ({topics.length})
              </button>
              <button
                onClick={() => setFilter('mine')}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                  filter === 'mine'
                    ? 'bg-gradient-secondary text-white shadow-soft'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-secondary'
                }`}
              >
                내 주제 ({topics.filter(t => !t.isAIGenerated).length})
              </button>
              <button
                onClick={() => setFilter('ai')}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                  filter === 'ai'
                    ? 'bg-gradient-accent text-white shadow-soft'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-accent'
                }`}
              >
                AI 생성 ({topics.filter(t => t.isAIGenerated).length})
              </button>
            </div>
          </div>

          {/* Topic Cards Grid */}
          {filteredTopics.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="group bg-white rounded-3xl p-6 border-2 border-dashed border-border hover:border-primary transition-all shadow-soft hover:shadow-medium animate-fade-in-up relative overflow-hidden"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  {/* Ticket Pattern Background */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary opacity-50"></div>
                  
                  {/* AI Badge */}
                  {topic.isAIGenerated && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-accent text-white text-xs font-bold rounded-full shadow-soft flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </div>
                  )}

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-text-primary mb-3 pr-12 line-clamp-2">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                      {topic.description}
                    </p>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-4">
                        {topic.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-muted text-text-secondary text-xs font-semibold rounded-full border border-border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions - Show on hover */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold hover:shadow-glow transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      onClick={() => initiateDelete(topic)}
                      className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <BookOpen className="w-20 h-20 text-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-text-primary mb-2">주제가 없습니다</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery ? '검색 결과가 없습니다' : '첫 토론 주제를 추가해보세요'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Undo Snackbar */}
      {deletedTopic && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-full shadow-strong flex items-center gap-4">
            <span className="font-medium">주제가 삭제되었습니다</span>
            <button
              onClick={handleUndo}
              className="px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              실행 취소
            </button>
          </div>
        </div>
      )}

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-strong animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">새 주제 추가</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  주제 제목
                </label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="예: 학교에서 스마트폰 사용 허용"
                  className="w-full px-5 py-4 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  주제 설명
                </label>
                <textarea
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                  placeholder="예: 학생들의 학교 내 스마트폰 사용을 허용해야 하는가?"
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-border text-text-secondary rounded-full font-semibold hover:bg-muted transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-full font-semibold hover:shadow-glow transition-all disabled:opacity-50 shadow-soft"
                >
                  {loading ? '추가 중...' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-strong animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">AI 주제 생성</h2>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleGenerateAITopic} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  어떤 주제를 만들까요?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="예: 환경 보호에 관한 토론 주제를 만들어줘"
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-border rounded-2xl focus:border-accent focus:ring-4 focus:ring-accent/20 outline-none transition-all resize-none"
                  required
                />
              </div>

              {isGenerating && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  <span className="text-text-secondary font-medium">AI가 생각 중...</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-white border-2 border-border text-text-secondary rounded-full font-semibold hover:bg-muted transition-all disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-gradient-accent text-white rounded-full font-semibold hover:shadow-glow transition-all disabled:opacity-50 shadow-soft flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? '생성 중...' : '생성하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && topicToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-strong animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">주제 삭제</h2>
              <p className="text-text-secondary">
                정말 이 주제를 삭제하시겠습니까?
              </p>
              <p className="text-sm font-bold text-text-primary mt-3">
                "{topicToDelete.title}"
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTopicToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-white border-2 border-border text-text-secondary rounded-full font-semibold hover:bg-muted transition-all"
              >
                취소
              </button>
              <button
                onClick={handleDeleteTopic}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all shadow-soft"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

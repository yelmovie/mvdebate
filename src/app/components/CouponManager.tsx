import React, { useState } from 'react';
import { apiCall } from '../../utils/supabase';
import { 
  ArrowLeft, Gift, Check, Users, Sparkles, 
  Armchair, Lightbulb, Crown, Shield, X, Plus, Edit3,
  History, CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { useAlert } from './AlertProvider';

interface CouponManagerProps {
  onBack: () => void;
  demoMode?: boolean;
  classes: any[];
  students: any[];
}

const COUPON_TYPES = [
  { 
    id: 'seat-change', 
    name: '자리 바꾸기 1회권', 
    icon: Armchair,
    description: '원하는 자리로 이동',
    gradient: 'from-blue-400 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  { 
    id: 'hint-card', 
    name: '원하는 음악 친구들과 함께듣기 권', 
    icon: Lightbulb,
    description: '점심시간 음악 선곡',
    gradient: 'from-yellow-400 to-yellow-600',
    bgGradient: 'from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700'
  },
  { 
    id: 'nomination', 
    name: '숙제 지목권', 
    icon: Crown,
    description: '숙제 검사 면제',
    gradient: 'from-purple-400 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  { 
    id: 'penalty-pass', 
    name: '급식먼저먹기 권', 
    icon: Shield,
    description: '급식 줄서기 면제',
    gradient: 'from-red-400 to-red-600',
    bgGradient: 'from-red-50 to-red-100',
    borderColor: 'border-red-200',
    textColor: 'text-red-700'
  },
  { 
    id: 'custom', 
    name: '커스텀 쿠폰', 
    icon: Plus,
    description: '직접 만드는 특별 쿠폰',
    gradient: 'from-teal-400 to-teal-600',
    bgGradient: 'from-teal-50 to-teal-100',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700'
  },
];

interface IssuedCoupon {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  teacherId: string;
  couponType: string;
  customName?: string;
  customDescription?: string;
  createdAt: string;
  used: boolean;
  usedAt?: string;
}

export default function CouponManager({ onBack, demoMode = false, classes, students }: CouponManagerProps) {
  const { showAlert } = useAlert();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
  const [selectedCoupon, setSelectedCoupon] = useState(COUPON_TYPES[0].id);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [viewMode, setViewMode] = useState<'issue' | 'history'>('issue');
  const [issuedCoupons, setIssuedCoupons] = useState<IssuedCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused'>('all');
  
  // Custom coupon fields
  const [customCouponName, setCustomCouponName] = useState('');
  const [customCouponDescription, setCustomCouponDescription] = useState('');

  // Load issued coupons when switching to history view
  React.useEffect(() => {
    if (viewMode === 'history') {
      if (demoMode) {
        // Load demo data
        const mockCoupons: IssuedCoupon[] = [
          {
            id: 'coupon-1',
            classId: 'class-1',
            studentId: 'student-1',
            studentName: '김민수',
            studentEmail: 'minsu@example.com',
            teacherId: 'teacher-1',
            couponType: 'seat-change',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            used: true,
            usedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'coupon-2',
            classId: 'class-1',
            studentId: 'student-2',
            studentName: '박지영',
            studentEmail: 'jiyoung@example.com',
            teacherId: 'teacher-1',
            couponType: 'hint-card',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            used: false
          },
          {
            id: 'coupon-3',
            classId: 'class-1',
            studentId: 'student-3',
            studentName: '이준호',
            studentEmail: 'junho@example.com',
            teacherId: 'teacher-1',
            couponType: 'nomination',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            used: true,
            usedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'coupon-4',
            classId: 'class-1',
            studentId: 'student-1',
            studentName: '김민수',
            studentEmail: 'minsu@example.com',
            teacherId: 'teacher-1',
            couponType: 'penalty-pass',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            used: false
          }
        ];
        setIssuedCoupons(mockCoupons);
      } else {
        loadIssuedCoupons();
      }
    }
  }, [viewMode, demoMode]);

  async function loadIssuedCoupons() {
    setLoadingCoupons(true);
    try {
      const response = await apiCall('/coupons/issued');
      setIssuedCoupons(response.coupons || []);
    } catch (error: any) {
      console.error('Failed to load issued coupons:', error);
      showAlert(error.message || '쿠폰 목록을 불러오는데 실패했습니다', 'error');
    } finally {
      setLoadingCoupons(false);
    }
  }

  function toggleStudent(studentId: string) {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  }

  function toggleSelectAll() {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  }

  async function handleIssueCoupons() {
    if (selectedStudents.length === 0) {
      showAlert('쿠폰을 지급할 학생을 선택해주세요', 'warning');
      return;
    }

    // Validate custom coupon
    if (selectedCoupon === 'custom') {
      if (!customCouponName.trim()) {
        showAlert('쿠폰 이름을 입력해주세요', 'warning');
        return;
      }
      if (!customCouponDescription.trim()) {
        showAlert('쿠폰 설명을 입력해주세요', 'warning');
        return;
      }
    }

    setLoading(true);

    try {
      if (demoMode) {
        setTimeout(() => {
          // Success animation
          setShowConfetti(true);
          setShowSuccessToast(true);
          setSelectedStudents([]);
          setLoading(false);
          
          // Reset custom fields if custom coupon
          if (selectedCoupon === 'custom') {
            setCustomCouponName('');
            setCustomCouponDescription('');
          }
          
          // Hide toast after 3 seconds
          setTimeout(() => setShowSuccessToast(false), 3000);
          
          // Hide confetti after 4 seconds
          setTimeout(() => setShowConfetti(false), 4000);
        }, 800);
        return;
      }

      const couponData: any = {
        classId: selectedClass,
        couponType: selectedCoupon,
        studentIds: selectedStudents
      };

      // Add custom coupon data if custom type
      if (selectedCoupon === 'custom') {
        couponData.customName = customCouponName.trim();
        couponData.customDescription = customCouponDescription.trim();
      }

      await apiCall('/coupons/issue', {
        method: 'POST',
        body: JSON.stringify(couponData)
      });

      setShowConfetti(true);
      setShowSuccessToast(true);
      setSelectedStudents([]);
      
      // Reset custom fields if custom coupon
      if (selectedCoupon === 'custom') {
        setCustomCouponName('');
        setCustomCouponDescription('');
      }
      
      // Reload issued coupons if we're viewing history
      if (!demoMode) {
        loadIssuedCoupons();
      }
      
      setTimeout(() => setShowSuccessToast(false), 3000);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (error: any) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const selectedCouponInfo = COUPON_TYPES.find(c => c.id === selectedCoupon);
  const allSelected = students.length > 0 && selectedStudents.length === students.length;
  const isCustomCoupon = selectedCoupon === 'custom';

  // Get display name and description for preview
  const displayCouponName = isCustomCoupon && customCouponName.trim() 
    ? customCouponName.trim() 
    : selectedCouponInfo?.name || '';
  
  const displayCouponDescription = isCustomCoupon && customCouponDescription.trim()
    ? customCouponDescription.trim()
    : selectedCouponInfo?.description || '';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-accent"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCF7F', '#4D96FF', '#A78BFA'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-gradient-secondary text-white px-8 py-4 rounded-full shadow-strong flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-bold text-lg">
              {selectedStudents.length}명에게 쿠폰을 지급했습니다! 🎉
            </span>
          </div>
        </div>
      )}

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
              <Gift className="w-10 h-10 text-primary" />
              보상/쿠폰 관리
            </h1>
            <p className="text-text-secondary text-lg">우수 학생들에게 특별한 보상을 선물하세요</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 flex gap-4 border-b-2 border-border">
            <button
              onClick={() => setViewMode('issue')}
              className={`px-6 py-3 font-bold transition-all relative ${
                viewMode === 'issue'
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                쿠폰 발급
              </div>
              {viewMode === 'issue' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-6 py-3 font-bold transition-all relative ${
                viewMode === 'history'
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                발급 내역
              </div>
              {viewMode === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-full"></div>
              )}
            </button>
          </div>

          {/* Issue Coupons View */}
          {viewMode === 'issue' && (
            <div>
              {/* Class Selection */}
              <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-semibold text-text-secondary mb-2">반 선택</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full max-w-xs px-5 py-3 border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all bg-white shadow-soft"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.classCode})
                    </option>
                  ))}
                </select>
              </div>

          {/* Coupon Type Selection */}
          <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
              🎟️ 지급할 쿠폰 선택
            </h3>
            <div className="grid grid-cols-5 gap-6">
              {COUPON_TYPES.map((coupon, index) => {
                const Icon = coupon.icon;
                const isSelected = selectedCoupon === coupon.id;
                
                return (
                  <button
                    key={coupon.id}
                    onClick={() => setSelectedCoupon(coupon.id)}
                    className={`relative p-6 rounded-3xl transition-all transform hover:scale-105 ${
                      isSelected 
                        ? 'shadow-glow border-2' 
                        : 'shadow-soft hover:shadow-medium border-2 border-transparent'
                    }`}
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    {/* Ticket hole pattern */}
                    <div className="absolute top-0 left-0 w-full h-2 flex justify-around">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-background rounded-full"></div>
                      ))}
                    </div>

                    <div className={`bg-gradient-to-br ${coupon.bgGradient} rounded-2xl p-6 border-2 ${coupon.borderColor}`}>
                      {/* Icon */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${coupon.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-soft mx-auto transform ${isSelected ? 'scale-110' : ''} transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h4 className={`text-lg font-bold mb-2 ${coupon.textColor}`}>
                        {coupon.name}
                      </h4>

                      {/* Description */}
                      <p className="text-sm text-text-secondary">
                        {coupon.description}
                      </p>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-strong">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Coupon Form */}
          {isCustomCoupon && (
            <div className="mb-10 animate-fade-in-up bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 border-2 border-teal-200 shadow-medium">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-soft">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-teal-700">커스텀 쿠폰 만들기</h4>
                  <p className="text-sm text-text-secondary">원하는 쿠폰 내용을 직접 입력하세요</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    쿠폰 이름 *
                  </label>
                  <input
                    type="text"
                    value={customCouponName}
                    onChange={(e) => setCustomCouponName(e.target.value)}
                    placeholder="예: 조퇴권, 자유석 선택권, 간식 선택권 등"
                    maxLength={30}
                    className="w-full px-5 py-3.5 border-2 border-teal-300 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all bg-white shadow-soft text-text-primary placeholder:text-text-secondary"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-xs text-text-secondary">학생들에게 표시될 쿠폰 이름입니다</p>
                    <p className="text-xs text-teal-600 font-semibold">{customCouponName.length}/30</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    쿠폰 설명 *
                  </label>
                  <textarea
                    value={customCouponDescription}
                    onChange={(e) => setCustomCouponDescription(e.target.value)}
                    placeholder="예: 하루 1회 조퇴 가능, 원하는 자리에 앉을 수 있음, 좋아하는 간식 받기 등"
                    maxLength={100}
                    rows={3}
                    className="w-full px-5 py-3.5 border-2 border-teal-300 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all bg-white shadow-soft text-text-primary placeholder:text-text-secondary resize-none"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-xs text-text-secondary">쿠폰 사용 방법이나 혜택을 설명해주세요</p>
                    <p className="text-xs text-teal-600 font-semibold">{customCouponDescription.length}/100</p>
                  </div>
                </div>
              </div>

              {/* Custom Coupon Preview */}
              {customCouponName.trim() && customCouponDescription.trim() && (
                <div className="mt-6 p-5 bg-white rounded-2xl border-2 border-teal-300 shadow-soft">
                  <p className="text-xs font-semibold text-text-secondary mb-3">미리보기</p>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
                      <Gift className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-teal-700 mb-1">{customCouponName}</h5>
                      <p className="text-sm text-text-secondary">{customCouponDescription}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Selection */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <Users className="w-7 h-7 text-primary" />
                학생 선택 
                <span className="text-lg font-semibold px-4 py-1 bg-gradient-primary text-white rounded-full ml-2">
                  {selectedStudents.length}명
                </span>
              </h3>
              <button
                onClick={toggleSelectAll}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  allSelected
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
                }`}
              >
                {allSelected ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            {/* Student chips */}
            <div className="flex flex-wrap gap-3">
              {students.map((student, index) => {
                const isSelected = selectedStudents.includes(student.id);
                
                return (
                  <button
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`group relative px-5 py-3 rounded-full font-semibold transition-all flex items-center gap-3 animate-fade-in-up ${
                      isSelected
                        ? 'bg-gradient-primary text-white shadow-medium'
                        : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
                    }`}
                    style={{ animationDelay: `${500 + index * 30}ms` }}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected 
                        ? 'bg-white text-primary' 
                        : 'bg-gradient-primary text-white'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    
                    {/* Name */}
                    <span>{student.name}</span>

                    {/* Check or X icon */}
                    {isSelected && (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                );
              })}
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-text-secondary mx-auto mb-3 opacity-50" />
                <p className="text-text-secondary">학생이 없습니다</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={onBack}
              className="px-8 py-4 border-2 border-border text-text-secondary rounded-full hover:bg-muted transition-all font-semibold"
            >
              취소
            </button>
            <button
              onClick={handleIssueCoupons}
              disabled={loading || selectedStudents.length === 0 || (isCustomCoupon && (!customCouponName.trim() || !customCouponDescription.trim()))}
              className={`flex-1 px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-3 text-lg ${
                selectedStudents.length > 0 && (!isCustomCoupon || (customCouponName.trim() && customCouponDescription.trim()))
                  ? 'bg-gradient-primary text-white shadow-medium hover:shadow-glow animate-pulse-subtle'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  지급 중...
                </>
              ) : (
                <>
                  <Gift className="w-6 h-6" />
                  선택한 {selectedStudents.length}명에게 쿠폰 지급하기
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Preview Card */}
          {selectedCouponInfo && selectedStudents.length > 0 && (!isCustomCoupon || (customCouponName.trim() && customCouponDescription.trim())) && (
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-border shadow-soft animate-fade-in-up">
              <h4 className="text-lg font-bold text-text-primary mb-3">미리보기</h4>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${selectedCouponInfo.gradient} rounded-xl flex items-center justify-center shadow-soft`}>
                  {React.createElement(isCustomCoupon ? Gift : selectedCouponInfo.icon, { className: 'w-6 h-6 text-white' })}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-1">
                    <span className="font-bold text-text-primary">{selectedStudents.length}명</span>의 학생이
                  </p>
                  <p className="text-lg font-bold text-primary">
                    "{displayCouponName}" 쿠폰을 받게 됩니다
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {displayCouponDescription}
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

          {/* History View */}
          {viewMode === 'history' && (
            <div className="animate-fade-in-up">
              {loadingCoupons ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center gap-3 text-text-secondary">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-semibold">쿠폰 목록을 불러오는 중...</span>
                  </div>
                </div>
              ) : issuedCoupons.length === 0 ? (
                <div className="text-center py-20">
                  <Gift className="w-20 h-20 text-text-secondary mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-semibold text-text-secondary mb-2">발급된 쿠폰이 없습니다</p>
                  <p className="text-text-secondary mb-6">학생들에게 첫 번째 쿠폰을 발급해보세요</p>
                  <button
                    onClick={() => setViewMode('issue')}
                    className="px-6 py-3 bg-gradient-primary text-white rounded-full font-bold shadow-medium hover:shadow-glow transition-all"
                  >
                    쿠폰 발급하기
                  </button>
                </div>
              ) : (
                <div>
                  {/* Header with Refresh Button */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-text-primary">발급 내역</h3>
                    {!demoMode && (
                      <button
                        onClick={() => loadIssuedCoupons()}
                        disabled={loadingCoupons}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-border rounded-full hover:border-primary transition-all font-semibold text-text-secondary hover:text-text-primary disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${loadingCoupons ? 'animate-spin' : ''}`} />
                        새로고침
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 shadow-soft">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-soft">
                          <Gift className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary font-medium">총 발급</p>
                          <p className="text-3xl font-bold text-blue-700">{issuedCoupons.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200 shadow-soft">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-soft">
                          <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary font-medium">사용 완료</p>
                          <p className="text-3xl font-bold text-green-700">
                            {issuedCoupons.filter(c => c.used).length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 border-2 border-orange-200 shadow-soft">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-soft">
                          <Clock className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary font-medium">사용 대기</p>
                          <p className="text-3xl font-bold text-orange-700">
                            {issuedCoupons.filter(c => !c.used).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className="mb-6 flex gap-3">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                        filterStatus === 'all'
                          ? 'bg-gradient-primary text-white shadow-soft'
                          : 'bg-white text-text-secondary border-2 border-border hover:border-primary'
                      }`}
                    >
                      전체 ({issuedCoupons.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('unused')}
                      className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                        filterStatus === 'unused'
                          ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-soft'
                          : 'bg-white text-text-secondary border-2 border-border hover:border-orange-400'
                      }`}
                    >
                      사용 대기 ({issuedCoupons.filter(c => !c.used).length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('used')}
                      className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                        filterStatus === 'used'
                          ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-soft'
                          : 'bg-white text-text-secondary border-2 border-border hover:border-green-400'
                      }`}
                    >
                      사용 완료 ({issuedCoupons.filter(c => c.used).length})
                    </button>
                  </div>

                  {/* Coupons List */}
                  <div className="space-y-4">
                    {(() => {
                      const filteredCoupons = issuedCoupons.filter(coupon => {
                        if (filterStatus === 'all') return true;
                        if (filterStatus === 'used') return coupon.used;
                        if (filterStatus === 'unused') return !coupon.used;
                        return true;
                      });

                      if (filteredCoupons.length === 0) {
                        return (
                          <div className="text-center py-16">
                            <Gift className="w-16 h-16 text-text-secondary mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-semibold text-text-secondary">
                              {filterStatus === 'used' && '사용 완료된 쿠폰이 없습니다'}
                              {filterStatus === 'unused' && '사용 대기 중인 쿠폰이 없습니다'}
                            </p>
                          </div>
                        );
                      }

                      return filteredCoupons.map((coupon, index) => {
                        const couponInfo = COUPON_TYPES.find(t => t.id === coupon.couponType);
                        const Icon = couponInfo?.icon || Gift;
                        const isCustom = coupon.couponType === 'custom';
                        
                        return (
                        <div
                          key={coupon.id}
                          className={`bg-white rounded-3xl p-6 border-2 shadow-soft transition-all hover:shadow-medium ${
                            coupon.used 
                              ? 'border-green-200 bg-gradient-to-br from-green-50/30 to-green-100/30' 
                              : 'border-border'
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-6">
                            {/* Coupon Icon */}
                            <div className={`w-16 h-16 bg-gradient-to-br ${
                              isCustom 
                                ? 'from-teal-400 to-teal-600' 
                                : couponInfo?.gradient || 'from-gray-400 to-gray-600'
                            } rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>

                            {/* Coupon Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xl font-bold text-text-primary mb-1">
                                    {isCustom ? coupon.customName : couponInfo?.name}
                                  </h4>
                                  <p className="text-sm text-text-secondary mb-2">
                                    {isCustom ? coupon.customDescription : couponInfo?.description}
                                  </p>
                                </div>
                                
                                {/* Status Badge */}
                                {coupon.used ? (
                                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full shadow-soft flex-shrink-0">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-bold">사용 완료</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full shadow-soft flex-shrink-0">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-bold">사용 대기</span>
                                  </div>
                                )}
                              </div>

                              {/* Student & Date Info */}
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {coupon.studentName.charAt(0)}
                                  </div>
                                  <span className="font-semibold text-text-primary">
                                    {coupon.studentName}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-text-secondary">
                                  <span>•</span>
                                  <span>발급일: {new Date(coupon.createdAt).toLocaleDateString('ko-KR')}</span>
                                </div>

                                {coupon.used && coupon.usedAt && (
                                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                                    <span>•</span>
                                    <span>사용일: {new Date(coupon.usedAt).toLocaleDateString('ko-KR')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

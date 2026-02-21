'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift, Star, Crown, Zap, Heart, Shield, Music, BookOpen,
  Check, X, RefreshCw, ChevronRight, Sparkles, Users
} from 'lucide-react';
import { apiCall } from '../../lib/api';

interface CouponManagerProps {
  classId: string;
  students: any[];
  classes: any[];
  demoMode?: boolean;
  showAlert: (message: string, type?: string) => void;
}

interface CouponType {
  id: string;
  name: string;
  description: string;
  icon: any;
  gradient: string;
  isCustom?: boolean;
}

interface IssuedCoupon {
  id: string;
  studentId: string;
  studentName: string;
  couponTypeId: string;
  customName?: string;
  customDescription?: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
}

const couponTypes: CouponType[] = [
  {
    id: 'seat-change',
    name: '자리 바꾸기 1회권',
    description: '원하는 자리로 이동',
    icon: Users,
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    id: 'homework-pass',
    name: '숙제 면제권',
    description: '숙제 한 번 면제',
    icon: BookOpen,
    gradient: 'from-green-400 to-green-600',
  },
  {
    id: 'question-skip',
    name: '질문 지목권',
    description: '질문 검사 면제',
    icon: Shield,
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    id: 'lunch-skip',
    name: '급식 줄서기 면제권',
    description: '급식 줄서기 면제',
    icon: Star,
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    id: 'custom',
    name: '커스텀 쿠폰',
    description: '직접 만드는 특별 쿠폰',
    icon: Gift,
    gradient: 'from-pink-400 to-pink-600',
    isCustom: true,
  },
];

type ViewMode = 'issue' | 'history';
type FilterStatus = 'all' | 'unused' | 'used';

export default function CouponManager({ classId, students, classes, demoMode = false, showAlert }: CouponManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('issue');
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCustomCoupon, setIsCustomCoupon] = useState(false);
  const [customCouponName, setCustomCouponName] = useState('');
  const [customCouponDescription, setCustomCouponDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuedCoupons, setIssuedCoupons] = useState<IssuedCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [success, setSuccess] = useState(false);

  const selectedCouponInfo = couponTypes.find((c) => c.id === selectedCouponId);
  const allSelected = selectedStudents.length === students.length;

  const displayCouponName = isCustomCoupon
    ? customCouponName.trim()
    : selectedCouponInfo?.name || '';

  const displayCouponDescription = isCustomCoupon
    ? customCouponDescription.trim()
    : selectedCouponInfo?.description || '';

  const canIssue =
    selectedCouponId &&
    selectedStudents.length > 0 &&
    (!isCustomCoupon || (customCouponName.trim() && customCouponDescription.trim()));

  useEffect(() => {
    if (viewMode === 'history') {
      loadIssuedCoupons();
    }
  }, [viewMode]);

  async function loadIssuedCoupons() {
    setLoadingCoupons(true);
    try {
      if (demoMode) {
        const mockCoupons: IssuedCoupon[] = [
          {
            id: 'c1',
            studentId: students[0]?.id || 's1',
            studentName: students[0]?.name || '학생1',
            couponTypeId: 'seat-change',
            used: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            studentId: students[1]?.id || 's2',
            studentName: students[1]?.name || '학생2',
            couponTypeId: 'homework-pass',
            used: true,
            usedAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        setIssuedCoupons(mockCoupons);
        return;
      }
      const data = await apiCall(`/classes/${classId}/coupons`);
      setIssuedCoupons(data.coupons || []);
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  }

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  function toggleAllStudents() {
    if (allSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  }

  async function handleIssueCoupons() {
    if (!selectedStudents.length) {
      showAlert('쿠폰을 지급할 학생을 선택해주세요.', 'warning');
      return;
    }
    if (isCustomCoupon && !customCouponName.trim()) {
      showAlert('쿠폰 이름을 입력해주세요.', 'warning');
      return;
    }
    if (isCustomCoupon && !customCouponDescription.trim()) {
      showAlert('쿠폰 설명을 입력해주세요.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (!demoMode) {
        await apiCall(`/classes/${classId}/coupons`, {
          method: 'POST',
          body: {
            studentIds: selectedStudents,
            couponTypeId: selectedCouponId,
            customName: isCustomCoupon ? customCouponName.trim() : undefined,
            customDescription: isCustomCoupon ? customCouponDescription.trim() : undefined,
          },
        });
      }
      setSuccess(true);
    } catch (err) {
      console.error('Error issuing coupon:', err);
      showAlert('쿠폰 지급에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSuccess(false);
    setSelectedCouponId('');
    setSelectedStudents([]);
    setIsCustomCoupon(false);
    setCustomCouponName('');
    setCustomCouponDescription('');
  }

  const filteredCoupons = issuedCoupons.filter((c) => {
    if (filterStatus === 'unused') return !c.used;
    if (filterStatus === 'used') return c.used;
    return true;
  });

  return (
    <div className="min-h-screen bg-bg-base p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-text-primary flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            쿠폰 관리
          </h1>
          <p className="text-text-secondary mt-2">학생들에게 보상 쿠폰을 지급하고 관리하세요.</p>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-soft border-2 border-border">
          {[
            { id: 'issue', label: '쿠폰 발급', icon: Gift },
            { id: 'history', label: '발급 이력', icon: RefreshCw },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as ViewMode)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
                viewMode === id
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Issue View */}
        {viewMode === 'issue' && (
          <div className="space-y-6">
            {success ? (
              <div className="bg-white rounded-3xl p-12 shadow-soft border-2 border-border text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">쿠폰 지급 완료!</h2>
                <p className="text-text-secondary mb-2">
                  <span className="font-bold text-text-primary">{selectedStudents.length}명</span>에게 쿠폰을 지급했습니다.
                </p>
                <p className="text-lg font-bold text-primary mb-6">"{displayCouponName}" 쿠폰을 받게 됩니다!</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gradient-primary text-white rounded-2xl font-semibold"
                  >
                    새 쿠폰 발급
                  </button>
                  <button
                    onClick={() => setViewMode('history')}
                    className="px-6 py-3 border-2 border-border text-text-secondary rounded-2xl font-semibold hover:border-primary hover:text-primary transition-colors"
                  >
                    발급 이력 보기
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Coupon Type Selection */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <h2 className="text-lg font-bold text-text-primary mb-4">쿠폰 선택</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {couponTypes.map((coupon) => {
                      const Icon = coupon.icon;
                      const isSelected = selectedCouponId === coupon.id;
                      return (
                        <button
                          key={coupon.id}
                          onClick={() => {
                            setSelectedCouponId(coupon.id);
                            setIsCustomCoupon(!!coupon.isCustom);
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-primary shadow-medium bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br ${coupon.gradient} rounded-xl flex items-center justify-center mb-3 shadow-soft`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="font-bold text-text-primary text-sm">{coupon.name}</p>
                          <p className="text-xs text-text-secondary mt-1">{coupon.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Coupon Form */}
                {isCustomCoupon && (
                  <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                    <h2 className="text-lg font-bold text-text-primary mb-4">커스텀 쿠폰 설정</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">쿠폰 이름</label>
                        <input
                          type="text"
                          placeholder="쿠폰 이름을 입력하세요"
                          value={customCouponName}
                          onChange={(e) => setCustomCouponName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">쿠폰 설명</label>
                        <input
                          type="text"
                          placeholder="쿠폰 내용을 설명해주세요"
                          value={customCouponDescription}
                          onChange={(e) => setCustomCouponDescription(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Selection */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      학생 선택
                      <span className={`text-sm px-2 py-0.5 rounded-full ${selectedStudents.length > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-secondary'}`}>
                        {selectedStudents.length}명
                      </span>
                    </h2>
                    <button
                      onClick={toggleAllStudents}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        allSelected
                          ? 'bg-gradient-primary text-white shadow-soft'
                          : 'border-2 border-border text-text-secondary hover:border-primary hover:text-primary'
                      }`}
                    >
                      {allSelected ? '전체 해제' : '전체 선택'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {students.map((student) => {
                      const isSelected = selectedStudents.includes(student.id);
                      return (
                        <button
                          key={student.id}
                          onClick={() => toggleStudent(student.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'bg-gradient-primary text-white border-primary shadow-medium'
                              : 'border-border hover:border-primary bg-white text-text-primary'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            isSelected ? 'bg-white text-primary' : 'bg-primary/10 text-primary'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-sm truncate">{student.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                {selectedCouponInfo && selectedStudents.length > 0 && (!isCustomCoupon || (customCouponName.trim() && customCouponDescription.trim())) && (
                  <div className="bg-white rounded-3xl p-6 border-2 border-border shadow-soft">
                    <h4 className="text-lg font-bold text-text-primary mb-3">미리보기</h4>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${selectedCouponInfo.gradient} rounded-xl flex items-center justify-center shadow-soft`}>
                        {React.createElement(isCustomCoupon ? Gift : selectedCouponInfo.icon, { className: 'w-6 h-6 text-white' })}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-text-secondary mb-1">
                          <span className="font-bold text-text-primary">{selectedStudents.length}명</span>에게 쿠폰을 지급합니다.
                        </p>
                        <p className="text-lg font-bold text-primary">"{displayCouponName}"</p>
                        <p className="text-sm text-text-secondary mt-1">{displayCouponDescription}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Issue Button */}
                <button
                  onClick={handleIssueCoupons}
                  disabled={!canIssue || loading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    canIssue && !loading
                      ? 'bg-gradient-primary text-white shadow-medium hover:shadow-glow'
                      : 'bg-gray-100 text-text-secondary cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      지급 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      선택한 {selectedStudents.length}명에게 쿠폰 지급하기
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* History View */}
        {viewMode === 'history' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="bg-white rounded-3xl p-4 shadow-soft border-2 border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-text-primary">발급 이력</h3>
                <button
                  onClick={loadIssuedCoupons}
                  className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingCoupons ? 'animate-spin' : ''}`} />
                  새로고침
                </button>
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: `전체 (${issuedCoupons.length})` },
                  { id: 'unused', label: `미사용 (${issuedCoupons.filter((c) => !c.used).length})` },
                  { id: 'used', label: `사용 완료 (${issuedCoupons.filter((c) => c.used).length})` },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFilterStatus(id as FilterStatus)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      filterStatus === id
                        ? 'bg-gradient-primary text-white shadow-soft'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loadingCoupons ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-text-secondary">불러오는 중...</p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-20">
                <Gift className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold text-text-secondary mb-2">발급된 쿠폰이 없습니다.</p>
                {filterStatus === 'used' && <p className="text-text-secondary">사용 완료된 쿠폰이 없습니다.</p>}
                {filterStatus === 'unused' && <p className="text-text-secondary">미사용 중인 쿠폰이 없습니다.</p>}
                <button
                  onClick={() => setViewMode('issue')}
                  className="mt-6 px-6 py-3 bg-gradient-primary text-white rounded-full font-bold shadow-medium"
                >
                  쿠폰 발급하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCoupons.map((coupon) => {
                  const isCustom = coupon.couponTypeId === 'custom';
                  const couponInfo = couponTypes.find((c) => c.id === coupon.couponTypeId);
                  const Icon = couponInfo?.icon || Gift;
                  return (
                    <div
                      key={coupon.id}
                      className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                        coupon.used
                          ? 'border-green-200 bg-gradient-to-br from-green-50/30 to-green-100/30'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${
                          coupon.used
                            ? 'from-teal-400 to-teal-600'
                            : couponInfo?.gradient || 'from-gray-400 to-gray-600'
                        } rounded-xl flex items-center justify-center shadow-soft`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-text-primary">
                            {isCustom ? coupon.customName : couponInfo?.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {isCustom ? coupon.customDescription : couponInfo?.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-text-secondary">
                              학생: {coupon.studentName}
                            </span>
                            <span className="text-xs text-text-secondary">
                              발급: {new Date(coupon.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                        <div>
                          {coupon.used ? (
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                              <Check className="w-3 h-3" />
                              사용 완료
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                              미사용
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

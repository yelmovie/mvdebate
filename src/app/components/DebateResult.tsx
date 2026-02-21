import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../../lib/api';
import { ArrowLeft, Download, Loader2, Trophy, TrendingUp, 
  MessageSquare, Award, Sparkles, CheckCircle2, Star, Target
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAlert } from './AlertProvider';

interface DebateResultProps {
  debateId: string;
  onBack: () => void;
  demoMode?: boolean;
}

export default function DebateResult({ debateId, onBack, demoMode = false }: DebateResultProps) {
  const { showAlert } = useAlert();
  const [debate, setDebate] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDebateData();
  }, []);

  useEffect(() => {
    if (evaluation && !showConfetti) {
      // Show confetti after a short delay
      setTimeout(() => {
        setShowConfetti(true);
        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
      }, 500);
    }
  }, [evaluation]);

  async function loadDebateData() {
    try {
      if (demoMode) {
        setDebate({
          topicTitle: '?�교?�서 ?�마?�폰 ?�용 ?�용',
          topicDescription: '?�생?�의 ?�교 ???�마?�폰 ?�용???�용?�야 ?�는가?',
          position: 'for',
          character: 'tail_question_bora'
        });
        setEvaluation({
          participationScore: 90,
          logicScore: 85,
          evidenceScore: 82,
          overallFeedback: '?�리?�인 근거�????�시?�습?�다! 반론???�???�?�도 ?�절?�어?? 구체?�인 ?�시�???많이 ?�용?�면 ?�욱 ?�득???�는 ?�론????거예?? ?��',
          strengths: [
'?댁슜?낅땲??',
'?댁슜?낅땲??',
'?댁슜?낅땲??',
          ],
          improvements: [
'?댁슜?낅땲??',
'?댁슜?낅땲??',
          ]
        });
        setLoading(false);
        return;
      }
      
      const data = await apiCall(`/debates/${debateId}`);
      setDebate(data.debate);
      
      // If evaluation doesn't exist, create it automatically
      if (!data.evaluation) {
        console.log('No evaluation found, generating one automatically...');
        try {
          // Call evaluate endpoint to generate evaluation
          await apiCall(`/debates/${debateId}/evaluate`, {
            method: 'POST',
            body: JSON.stringify({
              selfScore: 75,
              selfFeedback: '?�론??참여?�습?�다.'
            })
          });
          
          // Reload debate data to get the evaluation
          const updatedData = await apiCall(`/debates/${debateId}`);
          setEvaluation(updatedData.evaluation || getDefaultEvaluation());
        } catch (evalError) {
          console.warn('Failed to generate evaluation, using default:', evalError);
          setEvaluation(getDefaultEvaluation());
        }
      } else {
        setEvaluation(data.evaluation);
      }
    } catch (error) {
      console.error('Error loading debate:', error);
      // Set fallback evaluation on error
      setEvaluation(getDefaultEvaluation());
    } finally {
      setLoading(false);
    }
  }

  function getDefaultEvaluation() {
    return {
      participationScore: 75,
      logicScore: 75,
      evidenceScore: 75,
      overallFeedback: '?�론??참여?�주?�서 감사?�니?? 계속 ?�습?�면 ?�욱 발전?????�어?? ?��',
      strengths: [
'?댁슜?낅땲??',
'?댁슜?낅땲??',
      ],
      improvements: [
'?댁슜?낅땲??',
'?댁슜?낅땲??',
      ]
    };
  }

  async function handleDownloadPDF() {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      // Wait a bit to ensure all styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        ignoreElements: (el) => {
          // Skip elements with animations
          return el.classList.contains('animate-confetti');
        },
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.body;
          
          // Comprehensive color mapping from oklch/oklab approximations to RGB
          const colorMap: { [key: string]: string } = {
            // Primary colors (coral orange shades)
            'oklch(0.7 0.15 35)': '#f97316',
            'oklch(0.65 0.15 35)': '#ea580c',
            // Secondary colors (mint green shades)
            'oklch(0.75 0.15 165)': '#10b981',
            'oklch(0.70 0.15 165)': '#059669',
            // Accent colors (sunflower yellow shades)
            'oklch(0.85 0.15 90)': '#eab308',
            'oklch(0.80 0.15 90)': '#ca8a04',
            // Purple shades
            'oklch(0.70 0.15 280)': '#8b5cf6',
            'oklch(0.65 0.15 280)': '#7c3aed',
            // Background/transparent whites
            'oklab(0.999994 0.0000455677 0.0000200868 / 0.8)': 'rgba(255, 255, 255, 0.8)',
            'oklab(0.758371 0.117152 0.0905613 / 0.2)': 'rgba(255, 140, 105, 0.2)',
          };
          
          // Helper function to check if a color string contains unsupported functions
          const hasUnsupportedColor = (colorStr: string): boolean => {
            if (!colorStr) return false;
            return /oklch\(|oklab\(|color-mix\(|lch\(|lab\(/i.test(colorStr);
          };
          
          // Helper function to convert color to safe format
          const convertToSafeColor = (colorStr: string): string => {
            if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)') return '';
            
            // Check if we have a direct mapping for this color
            if (colorMap[colorStr]) {
              return colorMap[colorStr];
            }
            
            // If it contains unsupported color functions, try to infer the color
            if (hasUnsupportedColor(colorStr)) {
              console.warn('Unsupported color format detected:', colorStr);
              
              // Try to extract lightness/chroma/hue or lab values to make better guesses
              // oklch format: oklch(L C H / alpha)
              const oklchMatch = colorStr.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
              if (oklchMatch) {
                const lightness = parseFloat(oklchMatch[1]);
                const chroma = parseFloat(oklchMatch[2]);
                const hue = parseFloat(oklchMatch[3]);
                const alpha = oklchMatch[4] ? parseFloat(oklchMatch[4]) : 1;
                
                // Rough approximation based on hue ranges
                if (hue >= 30 && hue <= 90) {
                  // Orange/Yellow range
                  if (chroma > 0.1) return lightness > 0.7 ? '#FFD93D' : '#FF8C69';
                  return lightness > 0.5 ? '#FFF8F5' : '#2D3748';
                } else if (hue >= 130 && hue <= 180) {
                  // Green range
                  if (chroma > 0.1) return '#7DD3C0';
                  return lightness > 0.5 ? '#FAFBFC' : '#2D3748';
                } else if (hue >= 240 && hue <= 280) {
                  // Purple/Blue range
                  return chroma > 0.1 ? '#A78BFA' : (lightness > 0.5 ? '#F7FAFC' : '#2D3748');
                }
                
                // Default based on lightness
                if (lightness > 0.9) return '#FFFFFF';
                if (lightness > 0.7) return '#F7FAFC';
                if (lightness > 0.5) return '#718096';
                return '#2D3748';
              }
              
              // oklab format: oklab(L a b / alpha)
              const oklabMatch = colorStr.match(/oklab\(([\d.]+)\s+([-\d.]+)\s+([-\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
              if (oklabMatch) {
                const lightness = parseFloat(oklabMatch[1]);
                const a = parseFloat(oklabMatch[2]);
                const b = parseFloat(oklabMatch[3]);
                const alpha = oklabMatch[4] ? parseFloat(oklabMatch[4]) : 1;
                
                // Check if it's mostly white/transparent
                if (lightness > 0.95 && Math.abs(a) < 0.01 && Math.abs(b) < 0.01) {
                  return alpha < 1 ? `rgba(255, 255, 255, ${alpha})` : '#FFFFFF';
                }
                
                // Check for warm colors (positive a and b)
                if (a > 0.05 && b > 0.05) {
                  return alpha < 1 ? `rgba(255, 140, 105, ${alpha})` : '#FF8C69';
                }
                
                // Default based on lightness
                if (lightness > 0.9) return '#FFFFFF';
                if (lightness > 0.5) return '#718096';
                return '#2D3748';
              }
              
              // Fallback to a neutral color
              return 'rgb(128, 128, 128)';
            }
            
            return colorStr;
          };
          
          // Remove all oklch/oklab/color-mix styles by replacing with inline RGB
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: any) => {
            // Get computed style from the original element in the DOM
            const originalEl = element.querySelector(`[data-id="${el.dataset?.id}"]`) || 
                               Array.from(element.querySelectorAll('*'))[Array.from(allElements).indexOf(el)];
            
            // Force inline styles to override any problematic computed styles
            const computedStyle = originalEl ? window.getComputedStyle(originalEl) : null;
            
            // CRITICAL: Force set ALL color properties to prevent oklch/oklab from being used
            // Background colors - check computed style first
            if (computedStyle) {
              const bgColor = computedStyle.backgroundColor;
              if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                const safeColor = convertToSafeColor(bgColor);
                if (safeColor) {
                  el.style.setProperty('background-color', safeColor, 'important');
                }
              }
            }
            
            // Fallback background color mapping based on classes
            if (el.classList.contains('bg-gradient-primary')) {
              el.style.backgroundColor = '#FF8C69';
              el.style.backgroundImage = 'none';
            }
            if (el.classList.contains('bg-gradient-secondary')) {
              el.style.backgroundColor = '#7DD3C0';
              el.style.backgroundImage = 'none';
            }
            if (el.classList.contains('bg-gradient-accent')) {
              el.style.backgroundColor = '#FFD93D';
              el.style.backgroundImage = 'none';
            }
            if (el.classList.contains('bg-white')) {
              el.style.backgroundColor = '#FFFFFF';
            }
            if (el.classList.contains('bg-background')) {
              el.style.backgroundColor = '#FAFBFC';
            }
            if (el.classList.contains('bg-gray-100')) {
              el.style.backgroundColor = '#f3f4f6';
            }
            if (el.classList.contains('bg-gray-200')) {
              el.style.backgroundColor = '#e5e7eb';
            }
            if (el.classList.contains('bg-green-500')) {
              el.style.backgroundColor = '#22c55e';
            }
            if (el.classList.contains('bg-blue-500')) {
              el.style.backgroundColor = '#3b82f6';
            }
            
            // Replace gradient backgrounds
            if (el.className && el.className.includes && el.className.includes('from-')) {
              el.style.backgroundImage = 'none';
              if (el.classList.contains('from-green-50')) {
                el.style.backgroundColor = '#DCFCE7';
              }
              if (el.classList.contains('from-yellow-50')) {
                el.style.backgroundColor = '#FEF9C3';
              }
              if (el.classList.contains('from-orange-50')) {
                el.style.backgroundColor = '#FFEDD5';
              }
              if (el.classList.contains('from-blue-50')) {
                el.style.backgroundColor = '#EFF6FF';
              }
              if (el.classList.contains('from-primary')) {
                el.style.backgroundColor = '#FF8C69';
              }
            }
            
            // Text colors
            if (computedStyle) {
              const textColor = computedStyle.color;
              if (textColor) {
                const safeColor = convertToSafeColor(textColor);
                if (safeColor) {
                  el.style.setProperty('color', safeColor, 'important');
                }
              }
            }
            
            // Fallback text color mapping
            if (el.classList.contains('text-green-700')) {
              el.style.color = '#15803d';
            }
            if (el.classList.contains('text-yellow-700')) {
              el.style.color = '#a16207';
            }
            if (el.classList.contains('text-orange-700')) {
              el.style.color = '#c2410c';
            }
            if (el.classList.contains('text-green-500')) {
              el.style.color = '#22c55e';
            }
            if (el.classList.contains('text-blue-500')) {
              el.style.color = '#3b82f6';
            }
            if (el.classList.contains('text-primary')) {
              el.style.color = '#FF8C69';
            }
            if (el.classList.contains('text-white')) {
              el.style.color = '#FFFFFF';
            }
            if (el.classList.contains('text-text-primary')) {
              el.style.color = '#111827';
            }
            if (el.classList.contains('text-text-secondary')) {
              el.style.color = '#6B7280';
            }
            if (el.classList.contains('text-gray-500')) {
              el.style.color = '#6B7280';
            }
            
            // Border colors
            if (computedStyle) {
              const borderColor = computedStyle.borderColor;
              if (borderColor) {
                const safeColor = convertToSafeColor(borderColor);
                if (safeColor) {
                  el.style.setProperty('border-color', safeColor, 'important');
                }
              }
            }
            
            // Fallback border colors
            if (el.classList.contains('border-green-200')) {
              el.style.borderColor = '#bbf7d0';
            }
            if (el.classList.contains('border-yellow-200')) {
              el.style.borderColor = '#fef08a';
            }
            if (el.classList.contains('border-orange-200')) {
              el.style.borderColor = '#fed7aa';
            }
            if (el.classList.contains('border-blue-200')) {
              el.style.borderColor = '#bfdbfe';
            }
            if (el.classList.contains('border-primary')) {
              el.style.borderColor = '#FF8C69';
            }
            if (el.classList.contains('border-border')) {
              el.style.borderColor = '#e5e7eb';
            }
            
            // Force override any remaining problematic styles
            const inlineStyle = el.getAttribute('style') || '';
            if (hasUnsupportedColor(inlineStyle)) {
              // Remove the problematic inline styles
              el.style.backgroundColor = el.style.backgroundColor || '#FFFFFF';
              el.style.color = el.style.color || '#111827';
            }
            
            // Remove animations and transitions
            el.style.animation = 'none';
            el.style.transition = 'none';
            el.style.transform = 'none';
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`?�론결과_${debate?.topicTitle}_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('PDF ?�성 �??�류가 발생?�습?�다. ?�시 ?�도?�주?�요.');
    } finally {
      setDownloading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 85) return { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700', gradient: 'bg-gradient-secondary' };
    if (score >= 70) return { bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', gradient: 'bg-gradient-accent' };
    return { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700', gradient: 'bg-gradient-primary' };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">결과�?불러?�는 �?..</p>
        </div>
      </div>
    );
  }

  const avgScore = Math.round((evaluation.participationScore + evaluation.logicScore + evaluation.evidenceScore) / 3);
  const scoreColor = getScoreColor(avgScore);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-primary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-secondary"></div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                backgroundColor: ['#FF8C69', '#7DD3C0', '#FFD93D', '#A78BFA'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              ?�아가�?            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div ref={reportRef} className="space-y-8">
            {/* Celebration Banner */}
            <div className="text-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-accent rounded-full mb-6 shadow-medium animate-bounce-subtle">
                <Trophy className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">텍스트</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                ?�� ?�?�해?? ?��
              </h1>
              <p className="text-xl text-text-secondary">
                {debate?.topicTitle} ?�론???�료?�습?�다
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-6">
              {/* Participation Score */}
              <div className={`bg-gradient-to-br ${getScoreColor(evaluation.participationScore).bg} rounded-3xl p-8 border-2 ${getScoreColor(evaluation.participationScore).border} shadow-medium animate-fade-in-up hover:-translate-y-2 transition-all`} style={{ animationDelay: '100ms' }}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${getScoreColor(evaluation.participationScore).gradient} rounded-full flex items-center justify-center mb-4 shadow-medium`}>
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">참여도</h3>
                  <div className={`text-5xl font-bold ${getScoreColor(evaluation.participationScore).text} mb-2`}>
                    {evaluation.participationScore}
                  </div>
                  <p className="text-sm text-text-secondary">텍스트</p>
                </div>
              </div>

              {/* Logic Score */}
              <div className={`bg-gradient-to-br ${getScoreColor(evaluation.logicScore).bg} rounded-3xl p-8 border-2 ${getScoreColor(evaluation.logicScore).border} shadow-medium animate-fade-in-up hover:-translate-y-2 transition-all`} style={{ animationDelay: '200ms' }}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${getScoreColor(evaluation.logicScore).gradient} rounded-full flex items-center justify-center mb-4 shadow-medium`}>
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">논리력</h3>
                  <div className={`text-5xl font-bold ${getScoreColor(evaluation.logicScore).text} mb-2`}>
                    {evaluation.logicScore}
                  </div>
                  <p className="text-sm text-text-secondary">텍스트</p>
                </div>
              </div>

              {/* Evidence Score */}
              <div className={`bg-gradient-to-br ${getScoreColor(evaluation.evidenceScore).bg} rounded-3xl p-8 border-2 ${getScoreColor(evaluation.evidenceScore).border} shadow-medium animate-fade-in-up hover:-translate-y-2 transition-all`} style={{ animationDelay: '300ms' }}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${getScoreColor(evaluation.evidenceScore).gradient} rounded-full flex items-center justify-center mb-4 shadow-medium`}>
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">근거력</h3>
                  <div className={`text-5xl font-bold ${getScoreColor(evaluation.evidenceScore).text} mb-2`}>
                    {evaluation.evidenceScore}
                  </div>
                  <p className="text-sm text-text-secondary">충분한 근거 제시!</p>
                </div>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-medium border border-border animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">AI 선생님의 총평</h2>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-wrap">
                {evaluation.overallFeedback}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-2 border-green-200 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center shadow-soft">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">잘한 점</h3>
                </div>
                <ul className="space-y-3">
                  {evaluation.strengths?.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-text-secondary">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">개선할 점</h3>
                </div>
                <ul className="space-y-3">
                  {evaluation.improvements?.map((improvement: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm">→</span>
                      </div>
                      <span className="text-text-secondary">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Challenge Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-3xl p-8 border-2 border-primary/20 text-center animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <div className="text-5xl mb-4">텍스트</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">텍스트</h3>
              <p className="text-text-secondary mb-6">
                계속 연습하면 토론 실력이 쑥쑥 늘 거예요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="px-8 py-4 bg-gradient-primary text-white rounded-full font-bold shadow-medium hover:shadow-glow transition-all"
                >
                  ???�론 ?�작?�기
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="px-8 py-4 bg-white border-2 border-primary text-primary rounded-full font-bold shadow-soft hover:shadow-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>텍스트</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>결과 ?�운로드</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

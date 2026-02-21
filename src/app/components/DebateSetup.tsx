import React, { useState } from 'react';
import { apiCall } from '../../lib/api';
import { useAlert } from './AlertProvider';
import { ThumbsUp, ThumbsDown, ArrowLeft, Sparkles } from 'lucide-react';
import tailQuestionBoraAvatar from 'figma:asset/35e86e2eb84d01ead86eb1d16e66cf9e3992e0fb.png';
import praiseKingJuhoAvatar from 'figma:asset/80ee08a35862e871df6180d357efe4b9d58d314a.png';
import argumentMasterCheolsuAvatar from 'figma:asset/23d3f1087a3b105d457f7e8aa2bf4a95dd184e72.png';
import rebuttalExpertMinhoAvatar from 'figma:asset/64001235b26be6eedde43a65d5595e600ef518e6.png';
import ironLogicJihoAvatar from 'figma:asset/93e83e5d738ea14e776b197ad423da662e09f456.png';
import firmPumpkinDahyeAvatar from 'figma:asset/05ecfb10ee36955a35457baef561f42e1c5d21ed.png';
import bestFriendSoyoungAvatar from 'figma:asset/72a33d43ec544b8f8530efda53c1f94fc2406ecf.png';
import calmSujeongAvatar from 'figma:asset/c3b94bc5fad1208a7165f11b32730145fd05ce54.png';
import factCollectorWoojinAvatar from 'figma:asset/fe00634207f10e23fa30f779b0b8e3f28684799e.png';
import kindYoungheeAvatar from 'figma:asset/a43a056f1cc854ceaf042d30d2a39facf5cfc1cf.png';

interface Topic {
  id?: string;
  title: string;
  description: string;
  isRandom?: boolean;
}

interface User {
  id: string;
  name: string;
}

interface DebateSetupProps {
  user: User;
  topic?: Topic;
  topics?: Topic[];
  onDebateCreated?: (debateId: string) => void;
  onBack?: () => void;
  onCancel?: () => void;
  onStartPreparation?: (config: any) => void;
  onStartDebate?: (config: any) => void;
  demoMode?: boolean;
}

const characters = [
  { id: 'tail_question_bora', name: '??????', description: '?? ???? ???? ???', difficulty: 'medium', personality: '???? ??? ?? ??', avatar: tailQuestionBoraAvatar },
  { id: 'argument_master_cheolsu', name: '?????', description: '??? ??? ???', difficulty: 'hard', personality: '??? ???? ???? ??', avatar: argumentMasterCheolsuAvatar },
  { id: 'rebuttal_expert_minho', name: '??????', description: '?? ??? ???? ???', difficulty: 'hard', personality: '??? ??? ???? ???? ??', avatar: rebuttalExpertMinhoAvatar },
  { id: 'iron_logic_jiho', name: '??????', description: '??? ??? ??', difficulty: 'hard', personality: '??? ??? ???? ???', avatar: ironLogicJihoAvatar },
  { id: 'praise_king_juho', name: '?????', description: '??? ???? ??? AI', difficulty: 'easy', personality: '???? ????? ??? ??', avatar: praiseKingJuhoAvatar },
  { id: 'firm_dahye', name: '?????', description: '???? ??? ??', difficulty: 'medium', personality: '??? ??? ?? ??', avatar: firmPumpkinDahyeAvatar },
  { id: 'best_friend_soyoung', name: '????', description: '???? ????? ???', difficulty: 'easy', personality: '???? ??? ??', avatar: bestFriendSoyoungAvatar },
  { id: 'calm_sujeong', name: '????', description: '???? ???? ??', difficulty: 'medium', personality: '?? ?? ???? ??', avatar: calmSujeongAvatar },
  { id: 'fact_collector_woojin', name: '????', description: '??? ???? ??', difficulty: 'medium', personality: '??? ??? ??? ??', avatar: factCollectorWoojinAvatar },
  { id: 'kind_younghee', name: '????', description: '???? ??? ???', difficulty: 'easy', personality: '???? ??? ????? ???', avatar: kindYoungheeAvatar },
];

export default function DebateSetup({
  user, topic, topics = [], onDebateCreated, onBack, onCancel, onStartPreparation, onStartDebate, demoMode = false
}: DebateSetupProps) {
  const { showAlert } = useAlert();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(topic || null);
  const [position, setPosition] = useState<'for' | 'against' | null>(null);
  const [character, setCharacter] = useState('tail_question_bora');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!selectedTopic) { showAlert('?? ??? ??????.', 'warning'); return; }
    if (!position) { showAlert('?? ?? ?? ??? ??????.', 'warning'); return; }

    const config = {
      topic: selectedTopic,
      position,
      character,
      difficulty: characters.find((c) => c.id === character)?.difficulty || 'medium',
    };

    if (onStartPreparation) { onStartPreparation(config); return; }
    if (onStartDebate) { onStartDebate(config); return; }

    setLoading(true);
    try {
      if (demoMode) {
        setTimeout(() => { onDebateCreated?.(`debate-${Date.now()}`); setLoading(false); }, 500);
        return;
      }
      const data = await apiCall('/debates', {
        method: 'POST',
        body: JSON.stringify({
          topicId: selectedTopic.id || null,
          topicTitle: selectedTopic.title,
          topicDescription: selectedTopic.description,
          position,
          character,
          difficulty: config.difficulty,
        }),
      });
      onDebateCreated?.(data.debate.id);
    } catch (err: any) {
      showAlert(err.message || '?? ??? ??????.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const selectedCharacter = characters.find((c) => c.id === character);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ???? */}
        <button onClick={onBack || onCancel} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" />
          버튼
        </button>

        <div className="bg-white rounded-3xl shadow-soft p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            텍스트
          </h1>

          {/* ?? ?? */}
          {!topic && topics.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">텍스트</h2>
              <div className="space-y-3">
                {topics.map((t) => (
                  <button
                    key={t.id || t.title}
                    onClick={() => setSelectedTopic(t)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedTopic?.title === t.title
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-semibold text-text-primary">{t.title}</p>
                    <p className="text-sm text-text-secondary mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTopic && (
            <div className="mb-6 p-4 bg-primary/10 rounded-2xl">
              <p className="text-sm text-text-secondary font-medium">텍스트</p>
              <p className="font-bold text-text-primary">{selectedTopic.title}</p>
            </div>
          )}

          {/* ?? ?? */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-text-primary mb-4">텍스트</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPosition('for')}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                  position === 'for'
                    ? 'border-green-500 bg-green-50'
                    : 'border-border hover:border-green-300'
                }`}
              >
                <ThumbsUp className={`w-8 h-8 ${position === 'for' ? 'text-green-600' : 'text-text-secondary'}`} />
                <span className={`font-bold text-lg ${position === 'for' ? 'text-green-700' : 'text-text-primary'}`}>텍스트</span>
              </button>
              <button
                onClick={() => setPosition('against')}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                  position === 'against'
                    ? 'border-red-500 bg-red-50'
                    : 'border-border hover:border-red-300'
                }`}
              >
                <ThumbsDown className={`w-8 h-8 ${position === 'against' ? 'text-red-600' : 'text-text-secondary'}`} />
                <span className={`font-bold text-lg ${position === 'against' ? 'text-red-700' : 'text-text-primary'}`}>텍스트</span>
              </button>
            </div>
          </div>

          {/* AI ??? ?? */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-text-primary mb-4">AI ??? ??</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setCharacter(char.id)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    character === char.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={char.avatar} alt={char.name} className="w-12 h-12 rounded-full object-cover" />
                  <p className={`text-xs font-semibold text-center leading-tight break-keep ${
                    character === char.id ? 'text-primary' : 'text-text-secondary'
                  }`}>
                    {char.name}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    char.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    char.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {char.difficulty === 'easy' ? '??' : char.difficulty === 'medium' ? '??' : '???'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ??? ??? ?? */}
          {selectedCharacter && (
            <div className="mb-8 p-4 bg-background rounded-2xl flex items-center gap-4">
              <img src={selectedCharacter.avatar} alt={selectedCharacter.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              <div>
                <p className="font-bold text-text-primary">{selectedCharacter.name}</p>
                <p className="text-sm text-text-secondary break-keep">{selectedCharacter.description}</p>
                <p className="text-xs text-primary mt-1">{selectedCharacter.personality}</p>
              </div>
            </div>
          )}

          {/* ?? ?? */}
          <button
            onClick={handleStart}
            disabled={loading || (!selectedTopic && !topic)}
            className="w-full py-4 bg-gradient-primary text-white rounded-2xl font-bold text-lg hover:shadow-glow transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ?? ?? ?...
              </div>
            ) : '?? ????'}
          </button>
        </div>
      </div>
    </div>
  );
}

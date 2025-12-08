
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDebateStore } from "../store/debateStore";
import { getTopics } from "../services/configService";
import { createSession } from "../services/debateService";
import type { Topic } from "../types/domain";

import { useStudent } from "../contexts/StudentContext";

export function useDebateSession() {
  const searchParams = useSearchParams();
  const nicknameParam = searchParams?.get("nickname") || "학생";
  const modeParam = searchParams?.get("mode");
  const topicIdParam = searchParams?.get("topicId");

  const { studentProfile } = useStudent(); // Integration

  const store = useDebateStore();
  const {
    currentUserId,
    setUser,
    currentTopic,
    setTopic,
    stance,
    session,
    startSession,
    isLoading,
    difficulty,
    selectedPersonaId
  } = store;

  const topics = getTopics();

  // Local UI state
  const [activeTab, setActiveTab] = useState<"list" | "random" | "custom">("list");
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  // 1. Initialize User from Student Profile if available
  useEffect(() => {
    if (studentProfile) {
        setUser(studentProfile.id, studentProfile.name);
    } else if (!currentUserId) {
        const id = `user-${Date.now()}`;
        setUser(id, nicknameParam);
    }
  }, [studentProfile, currentUserId, nicknameParam, setUser]);

  // 2. Initialize Topic based on URL params
  useEffect(() => {
    if (modeParam === "random" && currentTopic) {
        setActiveTab("random");
        return;
    }

    if (modeParam === "manual" && currentTopic?.id.toString() === topicIdParam) {
        setActiveTab("list");
        return;
    }

    if (modeParam === "custom") {
        setActiveTab("custom");
        return;
    }

    if (modeParam === "random") {
      setActiveTab("random");
      if (!currentTopic) {
        const randomIndex = Math.floor(Math.random() * topics.length);
        setTopic(topics[randomIndex]);
      }
    } else if (modeParam === "manual" && topicIdParam) {
      setActiveTab("list");
      if (!currentTopic || currentTopic.id.toString() !== topicIdParam) {
        const found = topics.find((t) => t.id.toString() === topicIdParam);
        if (found) {
          setTopic(found);
        }
      }
    }
  }, [modeParam, topicIdParam, currentTopic, setTopic, topics]);

  // 3. Handlers
  const handleResetDebate = () => {
    if (confirm("지금 토론을 끝내고 새로운 주제를 선택할까요?\n지금까지의 대화 내용과 평가 기록은 삭제됩니다.")) {
        useDebateStore.getState().reset(); 
        setActiveTab("list");
        setCustomTopicInput("");
        setShowSummaryPanel(false);
    }
  };

  const handleCreateSession = async () => {
    if (!currentUserId || !currentTopic || !stance || !selectedPersonaId) {
      alert("토론 상대를 선택해 주세요!");
      return;
    }
    
    // Check daily limit BEFORE creating session? Server will check.
    // Ideally we check here too but let's rely on server error.
    
    try {
      const s = await createSession({
        userId: currentUserId,
        nickname: studentProfile ? studentProfile.name : nicknameParam,
        classCode: studentProfile?.classCode, // Pass Class Code
        topicId: currentTopic.id,
        stance,
        difficulty: difficulty || "low",
        personaId: selectedPersonaId,
      });
      startSession(s);
    } catch (e: any) {
      console.error(e);
      // Handle limit error specifically if possible
      alert(e.message || "세션 생성 중 오류가 발생했습니다.");
    }
  };

  const handleCustomTopicSubmit = () => {
    if (!customTopicInput.trim()) {
        alert("토론 주제를 입력해 주세요.");
        return;
    }
    const newTopic: Topic = {
        id: `custom-${Date.now()}`,
        title: customTopicInput.trim(),
        category: "custom", 
        difficulty: 1, 
        tags: ["custom"]
    };
    setTopic(newTopic);
  };

  return {
    // Store State
    store,
    currentTopic,
    stance,
    session,
    isLoading,
    selectedPersonaId,
    
    // UI State
    activeTab, 
    setActiveTab,
    customTopicInput, 
    setCustomTopicInput,
    showSummaryPanel, 
    setShowSummaryPanel,
    topics,

    // Actions
    handleResetDebate,
    handleCreateSession,
    handleCustomTopicSubmit,
    stanceLabel: stance === "pro" ? "찬성 입장" : stance === "con" ? "반대 입장" : "입장 미선택"
  };
}

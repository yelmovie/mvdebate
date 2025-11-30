"use client";

import { Topic } from "../../types/domain";
import { useDebateStore } from "../../store/debateStore";
import { useState } from "react";

interface Props {
  topics: Topic[];
}

export default function TopicSelector({ topics }: Props) {
  const { setTopic } = useDebateStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePick = () => {
    setTopic(topics[currentIndex]);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % topics.length;
    setCurrentIndex(next);
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * topics.length);
    setCurrentIndex(randomIndex);
  };

  const topic = topics[currentIndex];

  return (
    <section className="dashboard-card">
      <h2 className="debate-section-title">
        <span className="dot" />
        <span>1단계. 오늘의 토론 주제 고르기</span>
      </h2>
      <div className="debate-topic-header">
        <span className="topic-pill">{topic.title}</span>
      </div>
      <div className="topic-actions">
        <button className="btn btn-primary" onClick={handleRandom}>
          랜덤 토론 주제 뽑기
        </button>
        <button className="btn btn-secondary" onClick={handlePick}>
          이 주제로 할래요
        </button>
        <button className="btn btn-secondary" onClick={handleNext}>
          다른 주제 보기
        </button>
      </div>
    </section>
  );
}

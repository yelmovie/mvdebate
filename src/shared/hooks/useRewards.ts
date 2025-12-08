import { useState, useEffect } from 'react';
import { TeacherReward, RewardRequest, RewardType } from '../types/gamification';
import { DEFAULT_TEACHER_REWARDS } from '../constants/gamification';

// Mock Data Store (in-memory for demo)
let MOCK_TEACHER_REWARDS: TeacherReward[] = DEFAULT_TEACHER_REWARDS.map((r, i) => ({
  ...r,
  id: `reward-${i}`,
  teacherId: 'teacher-1'
}));

let MOCK_REQUESTS: RewardRequest[] = [];

export function useTeacherRewards() {
  const [rewards, setRewards] = useState<TeacherReward[]>([]);
  const [requests, setRequests] = useState<RewardRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setRewards([...MOCK_TEACHER_REWARDS]);
      setRequests([...MOCK_REQUESTS]);
      setLoading(false);
    }, 500);
  }, []);

  const addReward = (reward: Omit<TeacherReward, 'id' | 'teacherId'>) => {
    const newReward: TeacherReward = {
      ...reward,
      id: `reward-${Date.now()}`,
      teacherId: 'teacher-1'
    };
    MOCK_TEACHER_REWARDS = [...MOCK_TEACHER_REWARDS, newReward];
    setRewards(MOCK_TEACHER_REWARDS);
  };

  const updateReward = (id: string, updates: Partial<TeacherReward>) => {
    MOCK_TEACHER_REWARDS = MOCK_TEACHER_REWARDS.map(r => r.id === id ? { ...r, ...updates } : r);
    setRewards(MOCK_TEACHER_REWARDS);
  };

  const deleteReward = (id: string) => {
    MOCK_TEACHER_REWARDS = MOCK_TEACHER_REWARDS.filter(r => r.id !== id);
    setRewards(MOCK_TEACHER_REWARDS);
  };

  const approveRequest = (requestId: string) => {
    // In real app, this would deduct coins from student
    MOCK_REQUESTS = MOCK_REQUESTS.map(req => req.id === requestId ? { ...req, status: 'approved' } : req);
    setRequests(MOCK_REQUESTS);
  };

  const rejectRequest = (requestId: string) => {
    MOCK_REQUESTS = MOCK_REQUESTS.map(req => req.id === requestId ? { ...req, status: 'rejected' } : req);
    setRequests(MOCK_REQUESTS);
  };

  return { rewards, requests, loading, addReward, updateReward, deleteReward, approveRequest, rejectRequest };
}

export function useStudentRewards() {
  const [availableRewards, setAvailableRewards] = useState<TeacherReward[]>([]);
  const [myRequests, setMyRequests] = useState<RewardRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      // Filter only active rewards for students
      setAvailableRewards(MOCK_TEACHER_REWARDS.filter(r => r.active));
      setMyRequests(MOCK_REQUESTS.filter(r => r.studentId === 'student-1')); // assumption
      setLoading(false);
    }, 500);
  }, []);

  const requestReward = (reward: TeacherReward) => {
    const newRequest: RewardRequest = {
      id: `req-${Date.now()}`,
      studentId: 'student-1',
      studentName: '학생1',
      rewardId: reward.id,
      rewardName: reward.name,
      cost: reward.cost,
      status: 'pending',
      requestedAt: new Date()
    };
    MOCK_REQUESTS = [...MOCK_REQUESTS, newRequest];
    setMyRequests([...myRequests, newRequest]);
  };

  return { availableRewards, myRequests, loading, requestReward };
}

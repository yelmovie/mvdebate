"use client";

import { useEffect, useState } from "react";
import AdminGuard from "../../../components/auth/AdminGuard";
import { getAllUsers, toggleUserActive, sendPasswordResetToUser } from "../../../services/adminUserService";
import type { UserProfile } from "../../../types/schema";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (uid: string, currentStatus?: boolean) => {
    try {
        const newStatus = !currentStatus;
        if (!confirm(`정말 이 계정을 ${newStatus ? '활성화' : '비활성화'} 하시겠습니까?`)) return;
        
        await toggleUserActive(uid, newStatus);
        // Optimistic update or refetch
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isActive: newStatus } : u));
    } catch (err: any) {
        alert("상태 변경 실패: " + err.message);
    }
  };

  const handleResetPassword = async (email: string) => {
      try {
          if (!confirm(`${email} 계정으로 비밀번호 재설정 메일을 발송하시겠습니까?`)) return;
          await sendPasswordResetToUser(email);
          alert("재설정 메일을 발송했습니다.");
      } catch (err: any) {
          alert("메일 발송 실패: " + err.message);
      }
  };

  return (
    <AdminGuard>
      <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 className="dashboard-title">관리자 대시보드 - 회원 관리</h1>
        
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead style={{ background: "var(--ms-surface)", borderBottom: "1px solid var(--ms-border)" }}>
                        <tr>
                            <th style={{ padding: "12px", textAlign: "left" }}>이메일</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>이름</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>역할</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>학년/반</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>가입일</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>상태</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>관리 액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: "20px", textAlign: "center" }}>Loading users...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.uid} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "12px" }}>{user.email}</td>
                                <td style={{ padding: "12px" }}>{user.name}</td>
                                <td style={{ padding: "12px" }}>
                                    <span style={{ 
                                        padding: "4px 8px", 
                                        borderRadius: "12px", 
                                        fontSize: "12px",
                                        background: user.role === 'admin' ? '#333' : user.role === 'teacher' ? '#007bff' : '#28a745',
                                        color: 'white'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: "12px" }}>
                                    {user.grade ? `${user.grade}학년 ${user.classNumber || '-'}반` : '-'}
                                </td>
                                <td style={{ padding: "12px", fontSize: "13px", color: "#666" }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <span style={{ color: user.isActive === false ? "red" : "green", fontWeight: "bold" }}>
                                        {user.isActive === false ? "비활성" : "활성"}
                                    </span>
                                </td>
                                <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                                    <button 
                                        onClick={() => handleResetPassword(user.email)}
                                        style={{ fontSize: "12px", padding: "4px 8px", cursor: "pointer" }}
                                    >
                                        🔑 비번 재설정
                                    </button>
                                    <button 
                                        onClick={() => handleToggleActive(user.uid, user.isActive)}
                                        style={{ 
                                            fontSize: "12px", 
                                            padding: "4px 8px", 
                                            cursor: "pointer",
                                            background: user.isActive === false ? "green" : "red",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px"
                                        }}
                                    >
                                        {user.isActive === false ? "활성화" : "⛔ 차단"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </AdminGuard>
  );
}

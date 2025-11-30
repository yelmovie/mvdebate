"use client";

import { useState, useEffect } from "react";

import { containsBadWords } from "../../utils/filterUtils";

interface Suggestion {
  id: string;
  nickname: string;
  content: string;
  createdAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SuggestionModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"submit" | "admin">("submit");
  
  // Submit State
  const [contactEmail, setContactEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin State
  const [password, setPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset states when modal opens
      setActiveTab("submit");
      setContactEmail("");
      setContent("");
      setPassword("");
      setIsAdminAuthenticated(false);
      setSuggestions([]);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // Email validation (only if provided)
    if (contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        alert("올바른 이메일 형식이 아닙니다.");
        return;
      }
    }

    if (containsBadWords(contactEmail) || containsBadWords(content)) {
      alert("비속어, 욕설, 성적 표현이 포함되어 있습니다. 바르고 고운 말을 사용해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Send contactEmail as 'nickname' (or "익명" if empty)
      const nickname = contactEmail.trim() || "익명";
      
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, content }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("소중한 제안 감사합니다! 개발자에게 전달되었습니다.");
        setContactEmail("");
        setContent("");
        onClose();
      } else {
        const errorMessage = data.error || "제안 전송에 실패했습니다.";
        alert(`오류: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(`제안 전송 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = () => {
    if (password === "1qaz2wsx") {
      setIsAdminAuthenticated(true);
      fetchSuggestions();
    } else {
      alert("관리자 비밀번호가 틀렸습니다.");
    }
  };

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/suggestions", { cache: "no-store" });
      const data = await response.json();
      
      if (response.ok) {
        setSuggestions(data.suggestions || []);
      } else {
        const errorMessage = data.error || "목록을 불러오는데 실패했습니다.";
        alert(`오류: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      alert(`목록을 불러오는 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // if (!confirm("정말 이 제안을 삭제하시겠습니까?")) return; // Removed confirmation as requested

    try {
      const response = await fetch(`/api/suggestions?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        // alert("삭제되었습니다."); // Optional: remove alert too if it's annoying, but keeping for feedback
        fetchSuggestions(); // Refresh list
      } else {
        const errorMessage = data.error || "삭제에 실패했습니다.";
        alert(`오류: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-box" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">💡 개발자에게 제안하기</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "20px" }}>
          <button
            style={{
              flex: 1,
              padding: "12px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "submit" ? "2px solid #2563eb" : "none",
              color: activeTab === "submit" ? "#2563eb" : "#6b7280",
              fontWeight: activeTab === "submit" ? 600 : 400,
              cursor: "pointer"
            }}
            onClick={() => setActiveTab("submit")}
          >
            제안하기
          </button>
          <button
            style={{
              flex: 1,
              padding: "12px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "admin" ? "2px solid #2563eb" : "none",
              color: activeTab === "admin" ? "#2563eb" : "#6b7280",
              fontWeight: activeTab === "admin" ? 600 : 400,
              cursor: "pointer"
            }}
            onClick={() => setActiveTab("admin")}
          >
            관리자 보기
          </button>
        </div>

        <div style={{ padding: "0 20px 20px 20px" }}>
          {activeTab === "submit" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                MovieSSam Debate Lab을 이용해주셔서 감사합니다!<br/>
                버그 제보, 기능 추가 요청, 기타 의견을 자유롭게 남겨주세요.
              </p>
              
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>
                  연락받으실 이메일
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="예: user@gmail.com (선택사항)"
                  className="filter-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>
                  제안 내용
                </label>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={content}
                    onChange={(e) => {
                      if (e.target.value.length <= 400) {
                        setContent(e.target.value);
                      }
                    }}
                    placeholder="내용을 입력하세요... (최대 400자)"
                    className="filter-input"
                    maxLength={400}
                    style={{ width: "100%", minHeight: "120px", resize: "vertical" }}
                  />
                  <div style={{ 
                    textAlign: "right", 
                    fontSize: "12px", 
                    color: content.length >= 400 ? "#ef4444" : "#6b7280",
                    marginTop: "4px" 
                  }}>
                    {content.length} / 400
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ marginTop: 8 }}
              >
                {isSubmitting ? "전송 중..." : "보내기"}
              </button>
            </div>
          ) : (
            // Admin View
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!isAdminAuthenticated ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ marginBottom: 12, color: "#374151" }}>관리자 비밀번호를 입력하세요.</p>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                    className="filter-input"
                    autoComplete="new-password"
                    style={{ width: "200px", textAlign: "center", marginBottom: 12 }}
                  />
                  <br/>
                  <button className="btn btn-primary" onClick={handleAdminLogin}>
                    확인
                  </button>
                </div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                      받은 제안 목록 ({suggestions.length})
                    </h3>
                    <button 
                      onClick={fetchSuggestions}
                      style={{ fontSize: 12, padding: "4px 8px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" }}
                    >
                      새로고침
                    </button>
                  </div>

                  {isLoading ? (
                    <p style={{ textAlign: "center", color: "#6b7280" }}>로딩 중...</p>
                  ) : suggestions.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>아직 등록된 제안이 없습니다.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {suggestions.map((item) => (
                        <div key={item.id} style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "#f9fafb" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{item.nickname}</span>
                              <span style={{ fontSize: 12, color: "#6b7280" }}>
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              style={{
                                border: "none",
                                background: "#fee2e2",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: 600
                              }}
                              title="삭제"
                            >
                              삭제
                            </button>
                          </div>
                          <p style={{ fontSize: 14, color: "#374151", whiteSpace: "pre-wrap", margin: 0 }}>
                            {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

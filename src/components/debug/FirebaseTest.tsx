"use client";

import { useState, useEffect } from "react";
import { signIn, signUp, logOut, subscribeToAuthChanges } from "../../services/authService";
import { addDocument, getCollection } from "../../services/firestoreService";
import { COLLECTIONS } from "../../firebase/constants";
import type { User } from "firebase/auth";

export default function FirebaseTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
      console.log("Auth State Changed:", u);
    });
    return () => unsubscribe();
  }, []);

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      alert("회원가입 성공!");
    } catch (e: any) {
      alert("회원가입 실패: " + e.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      alert("로그인 성공!");
    } catch (e: any) {
      alert("로그인 실패: " + e.message);
    }
  };

  const handleLogout = async () => {
    await logOut();
  };

  const handleAddLog = async () => {
    try {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }
        await addDocument(COLLECTIONS.LOGS, {
            message: testMessage,
            userId: user.uid,
            userEmail: user.email,
            timestamp: Date.now()
        });
        alert("데이터 저장 성공!");
        setTestMessage("");
        fetchLogs();
    } catch (e: any) {
        alert("데이터 저장 실패: " + e.message);
    }
  };

  const fetchLogs = async () => {
    try {
        const data = await getCollection(COLLECTIONS.LOGS);
        setLogs(data);
    } catch (e: any) {
        console.error(e);
    }
  };

  return (
    <div style={{ padding: 20, border: "2px solid #ccc", margin: 20, borderRadius: 8 }}>
      <h2>🔥 Firebase Integration Test</h2>
      
      <div style={{ marginBottom: 20 }}>
        <h3>1. Authentication</h3>
        {user ? (
          <div>
            <p>✅ Logged in as: <strong>{user.email}</strong></p>
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <input 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="filter-input"
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="filter-input"
            />
            <button onClick={handleSignIn} className="btn btn-primary">Sign In</button>
            <button onClick={handleSignUp} className="btn btn-secondary">Sign Up</button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>2. Firestore (Logs Collection)</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input 
                placeholder="Test Message" 
                value={testMessage} 
                onChange={e => setTestMessage(e.target.value)}
                className="filter-input" 
            />
            <button onClick={handleAddLog} className="btn btn-primary">Save to DB</button>
            <button onClick={fetchLogs} className="btn btn-secondary">Fetch Logs</button>
        </div>
        <div style={{ background: "#f5f5f5", padding: 10, borderRadius: 4, maxHeight: 150, overflowY: "auto" }}>
            {logs.map((log, i) => (
                <div key={i} style={{ borderBottom: "1px solid #ddd", padding: 4 }}>
                    <small>{new Date(log.timestamp).toLocaleString()}</small><br/>
                    <strong>{log.userEmail}</strong>: {log.message}
                </div>
            ))}
            {logs.length === 0 && <p>데이터가 없습니다.</p>}
        </div>
      </div>
    </div>
  );
}

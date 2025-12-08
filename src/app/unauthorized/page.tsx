import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🚫</h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>접근 권한이 없습니다.</h2>
      <p style={{ color: "var(--ms-text-muted)", marginBottom: "30px" }}>
        해당 페이지에 접근할 수 있는 권한이 없습니다.<br/>
        올바른 계정으로 로그인했는지 확인해주세요.
      </p>
      
      <div style={{ display: "flex", gap: "10px" }}>
        <Link href="/" className="btn btn-secondary">
          홈으로 가기
        </Link>
        <Link href="/login" className="btn btn-primary">
          로그인 페이지
        </Link>
      </div>
    </div>
  );
}

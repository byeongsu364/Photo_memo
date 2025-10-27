const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ 미들웨어 설정
app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ✅ MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB 연결 성공"))
    .catch((err) => console.error("❌ MongoDB 연결 실패:", err.message));

// ✅ 기본 라우트 확인용
app.get("/", (_req, res) => res.send("PhotoMemo + Post API OK 🚀"));

// ✅ 라우터 등록
const authroutes = require("./routes/authroutes");
const uploadRoutes = require("./routes/upload");
const postRoutes = require("./routes/post");   // 🆕 게시글 라우터 추가

app.use("/api/auth", authroutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/posts", postRoutes);              // 🧩 Post 라우트 연결

// ✅ 404 처리
app.use((req, res) => {
    res.status(404).json({ message: "요청하신 경로를 찾을 수 없습니다." });
});

// ✅ 500 에러 처리 (서버 오류)
app.use((err, req, res, next) => {
    console.error("🔥 서버 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
});

// ✅ 서버 실행
app.listen(PORT, () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
});

// src/context/PostContext.jsx
import { createContext, useContext } from "react";

// 🔹 게시글 관련 전역 컨텍스트 생성
export const PostContext = createContext();

// 🔹 컨텍스트를 간편히 사용할 수 있는 커스텀 훅
export const usePostsContext = () => useContext(PostContext);

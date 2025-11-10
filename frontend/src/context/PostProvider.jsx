// src/context/PostProvider.jsx
import React, { useState, useCallback, useEffect } from "react";
import { createPost, fetchMyPosts, updatedPost, deletePost } from "../api/postApi";
import { PostContext } from "./PostContext";

export const PostProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 게시글 전체 불러오기
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const list = await fetchMyPosts();
            setItems(list);
        } catch (err) {
            console.error("❌ 게시글 불러오기 실패:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔹 게시글 추가
    const add = useCallback(async ({ title, content, fileKeys = [] }) => {
        try {
            const created = await createPost({ title, content, fileKeys });
            setItems((prev) => [created, ...prev]);
            return created;
        } catch (err) {
            console.error("❌ 게시글 추가 실패:", err);
        }
    }, []);

    // 🔹 게시글 수정
    const update = useCallback(async (id, patch) => {
        try {
            const updated = await updatedPost(id, patch);
            setItems((prev) =>
                prev.map((i) => (i._id === id ? updated : i))
            );
            return updated;
        } catch (err) {
            console.error("❌ 게시글 수정 실패:", err);
        }
    }, []);

    // 🔹 게시글 삭제
    const remove = useCallback(async (id) => {
        try {
            await deletePost(id);
            setItems((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error("❌ 게시글 삭제 실패:", err);
        }
    }, []);

    // 🔹 컴포넌트 마운트 시 자동 로드
    useEffect(() => {
        load();
    }, [load]);

    return (
        <PostContext.Provider value={{ items, loading, load, add, update, remove }}>
            {children}
        </PostContext.Provider>
    );
};

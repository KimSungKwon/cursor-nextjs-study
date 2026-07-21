"use client";

import { create } from "zustand";

export interface SearchState {
  isOpen: boolean;
  keyword: string;
  open: () => void;
  close: () => void;
  setKeyword: (value: string) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  keyword: "",

  // 검색바 열기
  open: () => set({ isOpen: true }),

  // 검색바 닫기 (검색어는 유지)
  close: () => set({ isOpen: false }),

  // 검색어 설정
  setKeyword: (value) => set({ keyword: value }),

  // 검색바 닫기 + 검색어 초기화
  clear: () => set({ isOpen: false, keyword: "" }),
}));

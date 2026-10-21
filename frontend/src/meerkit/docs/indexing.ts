import { createContext } from "react";

/** 검색 인덱스를 만드는 중이면 true. 접혀 있는 내용(FAQ 답변 등)도 펼쳐서 렌더링하게 한다. */
export const IndexingContext = createContext(false);

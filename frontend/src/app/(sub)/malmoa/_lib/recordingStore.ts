// 녹음 조각을 브라우저 IndexedDB에 저장한다. 탭이 닫혀도 다시 열면 이어 붙여 복구할 수 있다.
const DB_NAME = "malmoa-recording";
const STORE = "chunks";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "seq" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    t.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    t.onerror = () => {
      db.close();
      reject(t.error);
    };
  });
}

export const saveChunk = (seq: number, blob: Blob, mime: string) => tx("readwrite", (s) => s.put({ seq, blob, mime }));
export const clearChunks = () => tx("readwrite", (s) => s.clear());

export async function loadChunks(): Promise<{ blobs: Blob[]; mime: string } | null> {
  const rows = await tx<{ seq: number; blob: Blob; mime: string }[]>("readonly", (s) => s.getAll());
  if (!rows.length) return null;
  rows.sort((a, b) => a.seq - b.seq);
  return { blobs: rows.map((r) => r.blob), mime: rows[0].mime };
}

import { useEffect, useState } from "react";

import {
  getDocumentChunks,
} from "../api/documentApi";

export default function useDocumentChunks(
  documentId
) {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setChunks([]);
      return;
    }

    let cancelled = false;

    const loadChunks = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getDocumentChunks(documentId);

        if (!cancelled) {
          setChunks(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Unable to load document chunks."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadChunks();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return {
    chunks,
    loading,
    error,
  };
}
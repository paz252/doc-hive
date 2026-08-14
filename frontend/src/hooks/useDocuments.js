import { useCallback, useEffect, useState, useRef } from "react";

import {
  deleteDocument,
  getDocuments,
  getDocumentStatus,
  uploadDocument,
} from "../api/documentApi";

const POLL_INTERVAL_MS = 1500;
const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED"]);

export default function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const pollTimers = useRef({});

  const stopPolling = useCallback((id) => {
    if (pollTimers.current[id]) {
      clearTimeout(pollTimers.current[id]);
      delete pollTimers.current[id];
    }
  }, []);

  const pollStatus = useCallback((id) => {
    const tick = async () => {
      try {
        const statusUpdate = await getDocumentStatus(id);

        setDocuments((current) =>
          current.map((document) =>
            document.id === id
              ? { ...document, ...statusUpdate }
              : document
          )
        );

        if (!TERMINAL_STATUSES.has(statusUpdate.status)) {
          pollTimers.current[id] = setTimeout(tick, POLL_INTERVAL_MS);
        } else {
          delete pollTimers.current[id];
        }
      } catch (err) {
        console.error(`Status poll failed for document ${id}:`, err);
        delete pollTimers.current[id];
      }
    };

    tick();
  }, []);

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const data = await getDocuments();
      setDocuments(data);

      data
        .filter((document) => !TERMINAL_STATUSES.has(document.status))
        .forEach((document) => pollStatus(document.id));
    } catch (err) {
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, [pollStatus]);

  useEffect(() => {
    loadDocuments();
    return () => {
      Object.values(pollTimers.current).forEach(clearTimeout);
    };
  }, [loadDocuments]);

  const upload = async (file) => {
    try {
      setError(null);
      setUploading(true);

      const document = await uploadDocument(file);

      setDocuments((current) => [document, ...current]);

      pollStatus(document.id);

      return document;
    } catch (err) {
      setError("Unable to upload document.");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    try {
      setError(null);
      stopPolling(id);

      await deleteDocument(id);

      setDocuments((current) =>
        current.filter((document) => document.id !== id)
      );
    } catch (err) {
      setError("Unable to delete document.");
      throw err;
    }
  };

  return {
    documents,
    loading,
    uploading,
    error,
    upload,
    remove,
    reload: loadDocuments,
  };
}
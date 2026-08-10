import { useCallback, useEffect, useState } from "react";

import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "../api/documentApi";

export default function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const upload = async (file) => {
    try {
      setError(null);
      setUploading(true);

      const document = await uploadDocument(file);

      setDocuments((current) => [
        document,
        ...current,
      ]);

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
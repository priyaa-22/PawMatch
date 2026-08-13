import { useState, useEffect, useCallback } from 'react';
import shelterService from '../services/shelter.service';
import { useAuth } from '../contexts/AuthContext';

export const useShelter = () => {
  const { user } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyShelter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shelterService.getMyShelter();
      if (res.success) {
        setShelter(res.data);
      } else {
        setError(res.message || 'Failed to fetch shelter profile.');
      }
      return res;
    } catch (err) {
      setError(err.message || 'Error fetching shelter profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShelterDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shelterService.getShelterDashboard();
      if (res.success) {
        setDashboard(res.data);
      } else {
        setError(res.message || 'Failed to fetch shelter dashboard.');
      }
      return res;
    } catch (err) {
      setError(err.message || 'Error fetching shelter dashboard.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShelterDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shelterService.getShelterDocuments();
      if (res.success) {
        setDocuments(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch shelter documents.');
      }
      return res;
    } catch (err) {
      setError(err.message || 'Error fetching shelter documents.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyShelter().catch(() => {
        // User may not be associated with a shelter yet, swallow initial missing shelter error
      });
    }
  }, [user, fetchMyShelter]);

  const registerShelter = async (payload) => {
    setLoading(true);
    try {
      const res = await shelterService.registerShelter(payload);
      if (res.success) {
        setShelter(res.data);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMyShelter = async (payload) => {
    setLoading(true);
    try {
      const res = await shelterService.updateMyShelter(payload);
      if (res.success) {
        setShelter(res.data);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (fileOrPayload, documentType) => {
    setLoading(true);
    try {
      const res = await shelterService.uploadShelterDocument(fileOrPayload, documentType);
      if (res.success) {
        await fetchShelterDocuments();
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    setLoading(true);
    try {
      const res = await shelterService.deleteShelterDocument(documentId);
      if (res.success) {
        await fetchShelterDocuments();
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async (shelterId) => {
    setLoading(true);
    try {
      const targetId = shelterId || shelter?.id;
      if (!targetId) {
        throw new Error('Shelter ID is required to submit verification.');
      }
      const res = await shelterService.submitShelterVerification(targetId);
      if (res.success) {
        await fetchMyShelter();
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    shelter,
    dashboard,
    documents,
    loading,
    error,
    fetchMyShelter,
    fetchShelterDashboard,
    fetchShelterDocuments,
    registerShelter,
    updateMyShelter,
    uploadDocument,
    deleteDocument,
    submitVerification,
  };
};

export default useShelter;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DepositApproval = () => {
  const { getTransactions, approveTransaction, rejectTransaction } = useAdmin();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const data = await getTransactions({ type: 'deposit', status: 'pending' });
      setDeposits(data.transactions || []);
    } catch (error) {
      console.error('Failed to load deposits:', error);
    } finally {
      setLoading(false);
    }

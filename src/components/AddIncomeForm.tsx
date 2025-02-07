'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input"

const AddIncomeForm = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !date) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/addIncome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, amount, date }),
      });

      if (response.ok) {
        setDescription('');
        setAmount('');
        setDate('');
        alert('Income added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to add income:', errorData);
        alert('Failed to add income.');
      }
    } catch (error) {
      console.error('Failed to add income:', error);
      alert('Failed to add income.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
        <Input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount:</label>
        <Input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date:</label>
        <Input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <button type="submit" className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Add Income</button>
    </form>
  );
};

export default AddIncomeForm;

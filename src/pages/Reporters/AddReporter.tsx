import React, { useState } from 'react';
import axios from '../../services/axiosConfig';
import { toastConfig } from '../../utils/toastConfig';

const AddReporter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        email,
        password,
        fullName:firstName + " " + lastName,
        role:"news_editor",
        is_verify: true,
      };

      // Use explicit URL to match provided curl example
      const url = `/signup`;

      const response = await axios.post(url, payload);

      toastConfig.success('Reporter created successfully');

      // Optionally clear form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to create reporter';
      toastConfig.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Add Reporter</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-transparent"
            placeholder="First name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-transparent"
            placeholder="Last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-transparent"
            placeholder="Password"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-brand-600 text-white rounded-md disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Add Reporter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReporter;

import React, { useState } from 'react';
import axios from '../../services/axiosConfig';
import { toastConfig } from '../../utils/toastConfig';

const AddPartner: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [referredByCode, setReferredByCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generate Referral Code Function
    const generateReferralCode = () => {
        // Basic implementation: Random uppercase string + numbers
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setReferralCode(code);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                email,
                password,
                fullName: firstName + " " + lastName,
                role: "partner",
                referralCode, // Own code
                referredByCode, // Code of the partner who referred them
                is_verify: true,
            };

            // Use explicit URL to match backend
            const url = `/signup`;

            await axios.post(url, payload);

            toastConfig.success('Partner created successfully');

            // Clear form
            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setReferralCode('');
            setReferredByCode('');
        } catch (err: any) {
            const message = err?.response?.data?.message || err.message || 'Failed to create partner';
            toastConfig.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-md shadow-sm">
            <h1 className="text-xl font-semibold mb-4">Add Partner</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
                            placeholder="First name"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
                            placeholder="Last name"
                        />
                    </div>
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

                <div>
                    <label className="block text-sm font-medium mb-1">Ref. Code (Optional)</label>
                    <input
                        value={referredByCode}
                        onChange={(e) => setReferredByCode(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-transparent"
                        placeholder="Referrer's code"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Enter the referral code of the partner who referred this new partner.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Referral Code</label>
                    <div className="flex gap-2">
                        <input
                            required
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-transparent"
                            placeholder="ENTER-CODE"
                        />
                        <button
                            type="button"
                            onClick={generateReferralCode}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Generate
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Create a unique referral code for this partner.
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-brand-600 text-white rounded-md disabled:opacity-60 bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Partner'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPartner;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Save, AlertCircle, Phone, Calendar, Activity, Weight, Ruler, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Form state
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        height: '',
        weight: '',
        bloodType: '',
        allergies: [],
        medicalConditions: [],
        emergencyContact: {
            name: '',
            phone: '',
            relation: ''
        }
    });

    const [newAllergy, setNewAllergy] = useState('');
    const [newCondition, setNewCondition] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userAPI.getProfile();
            const userData = data.user;
            
            setFormData({
                age: userData.age || '',
                gender: userData.gender || '',
                height: userData.height || '',
                weight: userData.weight || '',
                bloodType: userData.bloodType || '',
                allergies: userData.allergies || [],
                medicalConditions: userData.medicalConditions || [],
                emergencyContact: userData.emergencyContact || { name: '', phone: '', relation: '' }
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddItem = (type) => {
        if (type === 'allergy' && newAllergy.trim()) {
            setFormData(prev => ({
                ...prev,
                allergies: [...prev.allergies, newAllergy.trim()]
            }));
            setNewAllergy('');
        } else if (type === 'condition' && newCondition.trim()) {
            setFormData(prev => ({
                ...prev,
                medicalConditions: [...prev.medicalConditions, newCondition.trim()]
            }));
            setNewCondition('');
        }
    };

    const handleRemoveItem = (type, index) => {
        if (type === 'allergy') {
            setFormData(prev => ({
                ...prev,
                allergies: prev.allergies.filter((_, i) => i !== index)
            }));
        } else if (type === 'condition') {
            setFormData(prev => ({
                ...prev,
                medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await userAPI.updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-black p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-4xl space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/chat" className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Your Profile</h1>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl border ${
                        message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    } flex items-center gap-3`}>
                        <AlertCircle className="w-5 h-5" />
                        <p>{message.text}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Account Info Section */}
                        <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Account Information</h2>
                                    <p className="text-gray-500 text-sm">Your basic account details</p>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Username</label>
                                    <div className="w-full bg-[#161616] border border-[#262626] rounded-lg px-4 py-3 text-gray-300">
                                        {user?.username}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Email</label>
                                    <div className="w-full bg-[#161616] border border-[#262626] rounded-lg px-4 py-3 text-gray-300">
                                        {user?.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Health Section */}
                        <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Personal Health Details</h2>
                                    <p className="text-gray-500 text-sm">Used to provide personalized health insights</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Age
                                    </label>
                                    <input 
                                        type="number" 
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="e.g. 30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Gender
                                    </label>
                                    <select 
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Ruler className="w-4 h-4" /> Height (cm)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="e.g. 175"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Weight className="w-4 h-4" /> Weight (kg)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="e.g. 70"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-6 space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <Heart className="w-4 h-4" /> Blood Type
                                </label>
                                <select 
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={handleChange}
                                    className="w-full md:w-1/4 bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>

                        {/* Medical History Section */}
                        <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Medical History</h2>
                                    <p className="text-gray-500 text-sm">Important medical context</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Allergies */}
                                <div className="space-y-3">
                                    <label className="text-sm text-gray-400">Allergies</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newAllergy}
                                            onChange={(e) => setNewAllergy(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('allergy'))}
                                            className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="Add an allergy (e.g. Peanuts)"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleAddItem('allergy')}
                                            className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.allergies.map((allergy, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full text-sm border border-red-500/20">
                                                <span>{allergy}</span>
                                                <button type="button" onClick={() => handleRemoveItem('allergy', index)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Medical Conditions */}
                                <div className="space-y-3">
                                    <label className="text-sm text-gray-400">Medical Conditions</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newCondition}
                                            onChange={(e) => setNewCondition(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('condition'))}
                                            className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="Add a condition (e.g. Asthma)"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleAddItem('condition')}
                                            className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.medicalConditions.map((condition, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full text-sm border border-purple-500/20">
                                                <span>{condition}</span>
                                                <button type="button" onClick={() => handleRemoveItem('condition', index)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Emergency Contact */}
                         <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Emergency Contact</h2>
                                    <p className="text-gray-500 text-sm">Who to contact in case of emergency</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Name</label>
                                    <input 
                                        type="text" 
                                        name="emergencyContact.name"
                                        value={formData.emergencyContact.name}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="Contact Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Relation</label>
                                    <input 
                                        type="text" 
                                        name="emergencyContact.relation"
                                        value={formData.emergencyContact.relation}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="e.g. Spouse, Parent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Phone</label>
                                    <input 
                                        type="tel" 
                                        name="emergencyContact.phone"
                                        value={formData.emergencyContact.phone}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            >
                                {saving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};

// Helper for icons (X icon was missing in import)
const X = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

export default ProfilePage;

import React, { useState, useRef, useEffect } from 'react';
import { HeartPulse, User, LogOut, X, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const modalRef = useRef();
    const navRef = useRef();

    useEffect(() => {
        if (showLogoutModal && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [showLogoutModal]);

    useEffect(() => {
        // Basic animation for nav items on mount
        gsap.from('.nav-item-link', {
            y: -20,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out'
        });
    }, []);

    const confirmLogout = async () => {
        await logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    const handleFeaturesClick = (e) => {
        if (location.pathname === '/') {
            // If already on homepage, let the anchor work normally or scroll manually
            // The original code used <a href="#features">
        } else {
            e.preventDefault();
            navigate('/#features');
        }
    };

    return (
        <>
            {showLogoutModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div
                        ref={modalRef}
                        className="bg-[#151515] border border-gray-800 p-8 rounded-2xl w-[90%] max-w-md shadow-2xl relative"
                    >
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">Log Out</h3>
                            <p className="text-gray-400 mb-8">
                                Are you sure you want to log out? <br />
                                You will need to sign in again to access your chat history.
                            </p>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all"
                                >
                                    Yes, Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav ref={navRef} className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
                <Link to="/" className="nav-item-link flex items-center gap-2 cursor-pointer no-underline text-white">
                    <HeartPulse className="w-8 h-8 text-white" />
                    <div className="leading-tight">
                        <span className="block font-bold text-lg tracking-wide">VitalMind</span>
                        <span className="block text-xs text-gray-400">AI Health Assistant</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-300">
                    <a href="/#features" onClick={handleFeaturesClick} className="nav-item-link hover:text-emerald-400 transition-colors cursor-pointer no-underline">Features</a>
                    <Link to="/specialists" className="nav-item-link hover:text-emerald-400 transition-colors no-underline">Specialists</Link>
                    <Link to="/reviews" className="nav-item-link hover:text-emerald-400 transition-colors no-underline">Reviews</Link>
                    <Link to="/emergency" className="nav-item-link hover:text-emerald-400 transition-colors no-underline">Emergency</Link>
                </div>

                {user ? (
                    <div className="nav-item-link flex items-center gap-4">
                        <div
                            className="flex items-center gap-3 px-4 py-2 bg-[#1a1a1a] rounded-lg border border-gray-800 cursor-pointer"
                            onClick={() => navigate('/profile')}
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-200">{user.username}</span>
                        </div>

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="p-2 rounded-lg hover:bg-[#1a1a1a] border border-gray-800 hover:border-red-500/50 transition-all group"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                ) : (
                    <div className='flex gap-5'>
                        <Link to="/login" className="nav-item-link bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-6 py-2.5 rounded transition-all duration-300 no-underline">
                            Login
                        </Link>
                        <Link to="/signup" className="nav-item-link bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-6 py-2.5 rounded transition-all duration-300 no-underline">
                            Signup
                        </Link>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;

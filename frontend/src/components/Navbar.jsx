import React, { useState, useRef, useEffect } from 'react';
import { HeartPulse, User, LogOut, X, AlertCircle, Menu } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const modalRef = useRef();
    const navRef = useRef();
    const mobileMenuRef = useRef();

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
        gsap.fromTo('.nav-item-link', 
            { y: -20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out',
                clearProps: 'all'
            }
        );
    }, []);

    useEffect(() => {
        if (isMenuOpen && mobileMenuRef.current) {
            gsap.fromTo(mobileMenuRef.current,
                { x: '100%', opacity: 0 },
                { x: '0%', opacity: 1, duration: 0.5, ease: 'power3.out' }
            );
            // Animate items inside menu
            gsap.from('.mobile-nav-item', {
                x: 20,
                opacity: 0,
                duration: 0.4,
                stagger: 0.1,
                delay: 0.2,
                ease: 'power2.out'
            });
        }
    }, [isMenuOpen]);

    const confirmLogout = async () => {
        await logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    const handleFeaturesClick = (e) => {
        // Logic removed as per request to remove features link
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
                    <Link to="/" className="nav-item-link hover:text-emerald-400 transition-colors no-underline">Home</Link>
                    <Link to="/specialists" className="nav-item-link hover:text-emerald-400 transition-colors no-underline">Specialists</Link>
                    <Link to="/reviews" className="nav-item-link hover:text-emerald-400 transition-colors no-underline">Reviews</Link>
                    <Link to="/emergency" className="nav-item-link hover:text-emerald-400 transition-colors no-underline">Emergency</Link>
                </div>

                <div className="hidden md:flex items-center">
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
                            <Link to="/login" className="nav-item-link bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-6 py-2.5 rounded transition-colors duration-300 no-underline">
                                Login
                            </Link>
                            <Link to="/signup" className="nav-item-link bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-6 py-2.5 rounded transition-colors duration-300 no-underline">
                                Signup
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger Icon */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="md:hidden text-gray-300 hover:text-white p-2"
                >
                    <Menu className="w-8 h-8" />
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-xl md:hidden overflow-y-auto">
                    <div ref={mobileMenuRef} className="flex flex-col h-full p-8">
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-2">
                                <HeartPulse className="w-8 h-8 text-white" />
                                <span className="font-bold text-xl text-white">VitalMind</span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8 text-2xl font-bold text-gray-200">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="mobile-nav-item hover:text-emerald-400 transition-colors no-underline">Home</Link>
                            <Link to="/specialists" onClick={() => setIsMenuOpen(false)} className="mobile-nav-item hover:text-emerald-400 transition-colors no-underline">Specialists</Link>
                            <Link to="/reviews" onClick={() => setIsMenuOpen(false)} className="mobile-nav-item hover:text-emerald-400 transition-colors no-underline">Reviews</Link>
                            <Link to="/emergency" onClick={() => setIsMenuOpen(false)} className="mobile-nav-item hover:text-emerald-400 transition-colors no-underline">Emergency</Link>
                        </div>

                        <div className="mt-auto pt-10 border-t border-gray-800">
                            {user ? (
                                <div className="flex flex-col gap-6">
                                    <div
                                        className="flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-xl border border-gray-800"
                                        onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{user.username}</p>
                                            <p className="text-xs text-gray-400">View Profile</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setIsMenuOpen(false); setShowLogoutModal(true); }}
                                        className="w-full py-4 rounded-xl bg-red-600/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-600/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 rounded-xl bg-emerald-400 text-black font-bold text-center no-underline">
                                        Login
                                    </Link>
                                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full py-4 rounded-xl border border-emerald-400/30 text-emerald-400 font-bold text-center no-underline">
                                        Create Account
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

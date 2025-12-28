import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, AlertCircle, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analysisAPI } from '../utils/api';

const ReportPage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit.');
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
            setResult(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
             if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit.');
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('reportImage', file);

        try {
            const data = await analysisAPI.uploadReport(formData);
            setResult(data.analysis);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.response?.data?.message || 'Failed to analyze report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-black p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-5xl space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/chat" className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Health Report Analyzer</h1>
                        <p className="text-gray-500 text-sm">Upload your medical reports for a simplified AI explanation</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/50 text-red-400 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        <div 
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[400px] relative ${
                                preview ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-800 hover:border-emerald-500/50 hover:bg-[#151515]'
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {preview ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img src={preview} alt="Report Preview" className="max-h-[350px] object-contain rounded-lg shadow-lg mb-4" />
                                    <button 
                                        onClick={clearSelection}
                                        className="absolute top-0 right-0 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <p className="text-sm text-gray-400">{file?.name}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                                        <Upload className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Upload Report Image</h3>
                                    <p className="text-gray-500 text-sm mb-8 max-w-xs">
                                        Drag & drop your medical report image here, or click to browse. Supported formats: JPG, PNG.
                                    </p>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-xl font-medium transition-colors border border-gray-700 hover:border-gray-600"
                                    >
                                        Browse Files
                                    </button>
                                </>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                                !file || loading
                                    ? 'bg-[#1a1a1a] text-gray-500 cursor-not-allowed border border-gray-800'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Analyzing Report...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-6 h-6" />
                                    Analyze Report
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {!result && !loading && (
                            <div className="h-full border border-gray-800 rounded-2xl bg-[#0f0f0f] p-8 flex flex-col items-center justify-center text-center text-gray-500">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                                <p className="text-sm max-w-sm">Upload a report image to see the AI breakdown of your health data here.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full border border-gray-800 rounded-2xl bg-[#0f0f0f] p-8 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="space-y-4 w-full max-w-md">
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 animate-[loading_1.5s_ease-in-out_infinite] w-1/3"></div>
                                    </div>
                                    <p className="text-emerald-400 animate-pulse font-medium">Reading text from image...</p>
                                    <p className="text-gray-600 text-xs">This might take a few seconds depending on image quality.</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Summary Card */}
                                <div className="bg-[#151515] border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-3">Summary</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {result.summary}
                                    </p>
                                </div>

                                {/* Findings Grid */}
                                <div className="grid gap-6">
                                    {/* Abnormal / Attention Needed */}
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertTriangle className="w-6 h-6 text-red-400" />
                                            <h3 className="text-lg font-bold text-red-100">Attention Needed</h3>
                                        </div>
                                        {result.abnormalFindings && result.abnormalFindings.length > 0 ? (
                                            <ul className="space-y-3">
                                                {result.abnormalFindings.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0"></span>
                                                        <span className="text-gray-300 text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400 text-sm">No abnormal findings detected.</p>
                                        )}
                                    </div>

                                    {/* Normal Findings */}
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                                            <h3 className="text-lg font-bold text-emerald-100">Normal Findings</h3>
                                        </div>
                                         {result.normalFindings && result.normalFindings.length > 0 ? (
                                            <ul className="space-y-3">
                                                {result.normalFindings.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0"></span>
                                                        <span className="text-gray-300 text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400 text-sm">No specific normal findings listed.</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Recommendations */}
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-blue-100 mb-3">Recommendations</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {result.recommendations}
                                    </p>
                                </div>
                                
                                <p className="text-[10px] text-gray-600 text-center mt-4">
                                    Disclaimer: This analysis is generated by AI and may contain errors. Always consult a qualified healthcare professional for medical advice and diagnosis.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;


import React, { useState } from 'react';
import { Echo as EchoType } from '../types';
import { amplifyEcho } from '../services/geminiService';

interface EchoProps {
    echoes: EchoType[];
    onAddEcho: (echo: EchoType) => void;
}

const Echo: React.FC<EchoProps> = ({ echoes, onAddEcho }) => {
    const [observation, setObservation] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCapture, setShowCapture] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!observation) return;
        setLoading(true);
        try {
            const amplification = await amplifyEcho(observation, image || undefined);
            const newEcho: EchoType = {
                id: Math.random().toString(36).substr(2, 9),
                observation,
                image: image || undefined,
                amplification,
                timestamp: Date.now(),
            };
            onAddEcho(newEcho);
            setObservation('');
            setImage(null);
            setShowCapture(false);
        } catch (error) {
            console.error('Failed to amplify echo:', error);
            alert('Something went wrong. Let\'s try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center float">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Echo</h2>
                        <p className="text-slate-500 text-sm">Capture life's micro-beauties</p>
                    </div>
                </div>
            </div>

            {/* Capture Button or Form */}
            {!showCapture ? (
                <button
                    onClick={() => setShowCapture(true)}
                    className="w-full py-6 rounded-3xl border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                    <span className="text-rose-600 font-semibold">Share a beautiful moment</span>
                </button>
            ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="relative">
                        <textarea
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            className="w-full h-28 bg-white border border-rose-100 rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all outline-none resize-none"
                            placeholder="What beautiful thing did you notice today? ✨"
                        />
                        <div className="absolute bottom-3 right-3">
                            <label className="cursor-pointer bg-rose-50 hover:bg-rose-100 p-2 rounded-full border border-rose-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {image && (
                        <div className="relative rounded-2xl overflow-hidden h-40 border border-rose-100 shadow-sm">
                            <img src={image} alt="Captured moment" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setImage(null)}
                                className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1 rounded-full shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowCapture(false); setObservation(''); setImage(null); }}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!observation || loading}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${loading || !observation
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:shadow-xl'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                            ) : (
                                'Amplify ✨'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Echo Feed */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-700 px-1">Community Echoes</h3>
                {echoes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
                        <div className="text-4xl mb-3">🌸</div>
                        No echoes yet. Be the first to share something beautiful!
                    </div>
                ) : (
                    echoes.map((echo) => (
                        <div key={echo.id} className="echo-card p-5 space-y-3">
                            {echo.image && (
                                <div className="rounded-xl overflow-hidden h-36 -mx-1 -mt-1">
                                    <img src={echo.image} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <p className="text-slate-600 text-sm italic">"{echo.observation}"</p>
                            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-3 border border-rose-100">
                                <p className="text-rose-700 text-sm font-medium">{echo.amplification}</p>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-xs text-slate-400">
                                    {new Date(echo.timestamp).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button className="text-rose-400 hover:text-rose-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
                                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Echo;

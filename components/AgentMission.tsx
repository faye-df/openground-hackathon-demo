
import React, { useState, useEffect } from 'react';
import { AgentThought, ToolCall, AgentEvent, MissionPlan, MissionStep } from '../services/agentTypes';
import { MissionAgent, createMissionAgent } from '../services/agentOrchestrator';

interface AgentMissionProps {
    observation: string;
    image?: string;
    onComplete: (plan: MissionPlan) => void;
    onCancel: () => void;
}

const AgentMission: React.FC<AgentMissionProps> = ({ observation, image, onComplete, onCancel }) => {
    const [thoughts, setThoughts] = useState<AgentThought[]>([]);
    const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
    const [currentPlan, setCurrentPlan] = useState<MissionPlan | null>(null);
    const [phase, setPhase] = useState<'planning' | 'ready' | 'executing' | 'verifying'>('planning');
    const [verifyingStep, setVerifyingStep] = useState<string | null>(null);
    const [agent, setAgent] = useState<MissionAgent | null>(null);

    useEffect(() => {
        const missionId = Math.random().toString(36).substr(2, 9);

        const handleEvent = (event: AgentEvent) => {
            switch (event.type) {
                case 'thought':
                    setThoughts(prev => [...prev, event.thought]);
                    break;
                case 'tool_start':
                    setToolCalls(prev => [...prev, event.tool]);
                    break;
                case 'tool_complete':
                    setToolCalls(prev =>
                        prev.map(t => t.id === event.tool.id ? event.tool : t)
                    );
                    break;
                case 'mission_complete':
                    setPhase('ready');
                    break;
            }
        };

        const missionAgent = createMissionAgent(missionId, handleEvent);
        setAgent(missionAgent);

        // Start planning
        missionAgent.planMission(observation, image).then(plan => {
            setCurrentPlan(plan);
            setPhase('ready');
        });
    }, [observation, image]);

    const handleStartMission = () => {
        if (currentPlan) {
            onComplete(currentPlan);
        }
    };

    const getThoughtIcon = (type: AgentThought['type']) => {
        switch (type) {
            case 'reasoning': return '🧠';
            case 'planning': return '📋';
            case 'tool_call': return '🔧';
            case 'verification': return '✓';
            case 'adaptation': return '🔄';
            default: return '💭';
        }
    };

    const getToolIcon = (name: string) => {
        switch (name) {
            case 'get_location': return '📍';
            case 'get_weather': return '🌤️';
            case 'get_time': return '⏰';
            case 'search_nearby': return '🔍';
            case 'analyze_photo': return '📸';
            default: return '🔧';
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-white text-lg">🤖</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Mission Agent</h2>
                        <p className="text-slate-500 text-sm">
                            {phase === 'planning' && 'Planning your mission...'}
                            {phase === 'ready' && 'Mission ready!'}
                            {phase === 'executing' && 'Mission in progress...'}
                        </p>
                    </div>
                </div>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Observation Summary */}
            <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                <p className="text-sm text-slate-600 italic">"{observation}"</p>
            </div>

            {/* Tool Call Chain */}
            {toolCalls.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tool Calls</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {toolCalls.map((tool, i) => (
                            <div
                                key={tool.id}
                                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${tool.status === 'completed'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : tool.status === 'running'
                                            ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                                            : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                            >
                                <span>{getToolIcon(tool.name)}</span>
                                <span className="font-medium">{tool.name.replace('_', ' ')}</span>
                                {tool.status === 'running' && (
                                    <div className="w-3 h-3 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                )}
                                {tool.status === 'completed' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Agent Thoughts Stream */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent Reasoning</h3>
                <div className="bg-slate-900 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2">
                    {thoughts.map((thought, i) => (
                        <div
                            key={thought.id}
                            className="flex items-start gap-2 text-sm animate-in slide-in-from-left-2 duration-300"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <span className="flex-shrink-0">{getThoughtIcon(thought.type)}</span>
                            <span className="text-slate-300">{thought.content}</span>
                        </div>
                    ))}
                    {phase === 'planning' && (
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                            <span className="text-sm">Thinking...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Mission Plan Preview */}
            {currentPlan && (
                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100 space-y-4">
                        <div>
                            <h3 className="font-bold text-violet-900 text-lg">{currentPlan.title}</h3>
                            <p className="text-violet-700 text-sm mt-1">{currentPlan.problem}</p>
                        </div>

                        <div className="space-y-3">
                            {currentPlan.steps.map((step, i) => (
                                <div key={step.id} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${step.role === 'initiator' ? 'bg-violet-600' : 'bg-emerald-500'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800">{step.action}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Verify: {step.verificationCriteria}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-3 border-t border-violet-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-violet-500 uppercase font-bold">Secret Code</p>
                                    <p className="text-violet-800 font-bold">{currentPlan.secretCode}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-violet-500 uppercase font-bold">Duration</p>
                                    <p className="text-violet-800 text-sm">{currentPlan.estimatedDuration}</p>
                                </div>
                            </div>
                        </div>

                        {currentPlan.adaptations.length > 0 && (
                            <div className="bg-white/50 rounded-xl p-3">
                                <p className="text-xs text-violet-600 font-medium mb-1">🔄 Auto-adaptations ready:</p>
                                <p className="text-xs text-violet-500">{currentPlan.adaptations.join(' • ')}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleStartMission}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl transition-all active:scale-98"
                    >
                        Start Mission 🚀
                    </button>
                </div>
            )}
        </div>
    );
};

export default AgentMission;

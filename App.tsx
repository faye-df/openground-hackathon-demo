
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import Echo from './components/Echo';
import AgentMission from './components/AgentMission';
import { AppMode, Task, SocialMetrics, Echo as EchoType } from './types';
import { MissionPlan } from './services/agentTypes';
import { generateTaskFromObservation, analyzeMood } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [observation, setObservation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showAgent, setShowAgent] = useState(false);
  const [metrics, setMetrics] = useState<SocialMetrics>({
    totalInteractions: 124,
    activeTasks: 0,
    barriersRemoved: 42,
    collectiveMood: 'Optimistic',
    topKeywords: ['Shared Space', 'Greenery', 'Street Art', 'Kindness', 'Repair']
  });
  const [echoes, setEchoes] = useState<EchoType[]>([
    {
      id: 'echo-1',
      observation: 'A stranger held the door for me and we shared a smile',
      amplification: 'In that brief moment, two worlds touched and brightened each other. The door was just an excuse – the real gift was the recognition of shared humanity. ✨',
      timestamp: Date.now() - 3600000,
    }
  ]);

  const handleAddEcho = (echo: EchoType) => {
    setEchoes([echo, ...echoes]);
    setMetrics(prev => ({ ...prev, totalInteractions: prev.totalInteractions + 1 }));
  };

  // Load mock tasks on start
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Revive the Lonely Bench',
        problem: 'Bench near 5th Ave is covered in dry leaves and looks uninviting.',
        taskA: 'Clear the leaves and place a colorful leaf-bookmark on the corner.',
        taskB: 'Bring a fresh snack or book to leave on the bench for the next person.',
        secretCode: 'Tap shoulder three times',
        location: { lat: 0, lng: 0 },
        status: 'completed',
        timestamp: Date.now() - 3600000
      },
      {
        id: '2',
        title: 'Hidden Garden Support',
        problem: 'A small wild flower is growing in a crack, people might step on it.',
        taskA: 'Stand near the flower and point to it using your foot as a "barrier".',
        taskB: 'Find a small stone to place next to it as a protective border.',
        secretCode: 'Say: "The city breathes"',
        location: { lat: 0, lng: 0 },
        status: 'active',
        timestamp: Date.now() - 1200000
      }
    ];
    setTasks(mockTasks);
    setMetrics(prev => ({ ...prev, activeTasks: 1 }));
  }, []);

  const handleInitiateTask = async () => {
    if (!observation) return;
    setLoading(true);
    try {
      const generated = await generateTaskFromObservation(observation, image || undefined);
      const newTask: Task = {
        ...generated,
        id: Math.random().toString(36).substr(2, 9),
        location: { lat: 0, lng: 0 },
        status: 'active',
        timestamp: Date.now(),
        initiatorImage: image || undefined
      };
      setTasks([newTask, ...tasks]);
      setCurrentTask(newTask);
      setMode('task-details');
      setMetrics(prev => ({
        ...prev,
        activeTasks: prev.activeTasks + 1,
        totalInteractions: prev.totalInteractions + 1
      }));
    } catch (error) {
      console.error("Failed to generate task:", error);
      alert("Something went wrong. Let's try that again.");
    } finally {
      setLoading(false);
    }
  };

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

  const renderHome = () => (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="pt-8 space-y-4">
        <div className="w-16 h-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" />
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
          Open Happiness, <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Spark Resonance.</span>
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Every micro-collision makes our city less of an island. Let's create joy together.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setMode('initiate')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l3.2 3.2" /><path d="m13 3 5 5-5-5Z" /></svg>
          Start a Resonance
        </button>
        <button
          onClick={() => setMode('resonate')}
          className="w-full bg-white border-2 border-slate-100 hover:border-indigo-200 text-slate-700 font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
          Find Missions Near Me
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Social Heat</p>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {metrics.topKeywords.map((kw, i) => (
            <div key={i} className="flex-shrink-0 bg-slate-100 px-4 py-2 rounded-full text-slate-600 text-sm font-medium">
              {kw}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInitiate = () => (
    <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">What do you observe?</h2>
        <p className="text-slate-500">Notice something that needs a spark of human care.</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full h-32 bg-white border border-slate-200 rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
            placeholder="e.g., 'The bus stop sign is tilted and covered in old stickers...'"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {image && (
          <div className="relative rounded-2xl overflow-hidden h-48 border border-slate-100 shadow-sm">
            <img src={image} alt="Observation" className="w-full h-full object-cover" />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1 rounded-full shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowAgent(true)}
          disabled={!observation || loading}
          className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${loading || !observation
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-xl shadow-violet-200'
            }`}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-lg">🤖</span>
              Launch Mission Agent
            </>
          )}
        </button>
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex gap-4">
        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🤖</span>
        </div>
        <p className="text-xs text-violet-700 leading-relaxed">
          <strong>Marathon Agent:</strong> Gemini will autonomously gather context, plan adaptive missions, and verify completion through photo analysis.
        </p>
      </div>
    </div>
  );

  const renderResonate = () => (
    <div className="p-6 space-y-6 animate-in slide-in-from-left-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Missions Nearby</h2>
        <p className="text-slate-500">People around you are initiating urban change.</p>
      </div>

      {/* Mock Map View */}
      <div className="relative w-full h-64 bg-slate-200 rounded-3xl overflow-hidden border-2 border-white shadow-inner">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/800/600')] opacity-50 contrast-125 grayscale" />
        {/* Pulsing Dots */}
        {tasks.filter(t => t.status === 'active').map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setCurrentTask(t); setMode('task-details'); }}
            className="absolute z-10 animate-bounce"
            style={{ top: `${30 + i * 20}%`, left: `${40 + i * 15}%` }}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.5-7-11a7 7 0 1 1 14 0c0 3.5-7 11-7 11z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
          </button>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 glass-morphism rounded-full text-xs font-bold text-slate-700 border border-white/50 shadow-sm">
          Searching within 500m...
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 px-1">Active Missions</h3>
        {tasks.filter(t => t.status === 'active').length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
            No active missions nearby. Why not start one?
          </div>
        ) : (
          tasks.filter(t => t.status === 'active').map(task => (
            <div
              key={task.id}
              onClick={() => { setCurrentTask(task); setMode('task-details'); }}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3 cursor-pointer hover:border-indigo-200 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-1 rounded">Initiated Now</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {task.id}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-lg leading-tight">{task.title}</h4>
              <p className="text-slate-500 text-sm line-clamp-2">{task.problem}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                  <img src="https://picsum.photos/seed/1/32" className="w-8 h-8 rounded-full border-2 border-white" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">+1</div>
                </div>
                <button className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                  View Mission
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTaskDetails = () => {
    if (!currentTask) return null;
    return (
      <div className="p-6 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('home')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-slate-800 flex-1">{currentTask.title}</h2>
          </div>

          <div className="bg-slate-100 rounded-3xl p-5 space-y-2 border border-slate-200/50">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Problem Identified</h5>
            <p className="text-slate-700 text-sm leading-relaxed">{currentTask.problem}</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-dashed border-l-2 border-indigo-200 border-dashed" />

          <div className="space-y-12">
            {/* Task A */}
            <div className="relative pl-14">
              <div className="absolute left-0 top-0 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 text-white font-bold z-10">A</div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">For the Initiator</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{currentTask.taskA}</p>
              </div>
            </div>

            {/* Task B */}
            <div className="relative pl-14">
              <div className="absolute left-0 top-0 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 text-white font-bold z-10">B</div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">For the Resonator</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{currentTask.taskB}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-indigo-50 space-y-4 text-center">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Verification Code</h5>
          <div className="text-2xl font-black text-indigo-600 tracking-wider">
            {currentTask.secretCode.toUpperCase()}
          </div>
          <p className="text-xs text-slate-400 px-6 italic">
            "Wait for your partner to arrive. Perform this secret action or phrase together to complete the resonance."
          </p>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            onClick={() => {
              setTasks(tasks.map(t => t.id === currentTask.id ? { ...t, status: 'completed' } : t));
              setMetrics(prev => ({
                ...prev,
                activeTasks: Math.max(0, prev.activeTasks - 1),
                barriersRemoved: prev.barriersRemoved + 1
              }));
              alert("Social Barrier Broken! Success!");
              setMode('home');
            }}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            Mission Completed
          </button>
        </div>
      </div>
    );
  };

  const handleAgentComplete = (plan: MissionPlan) => {
    // Convert MissionPlan to Task format
    const newTask: Task = {
      id: plan.id,
      title: plan.title,
      problem: plan.problem,
      taskA: plan.steps[0]?.action || '',
      taskB: plan.steps[1]?.action || '',
      secretCode: plan.secretCode,
      location: { lat: 0, lng: 0 },
      status: 'active',
      timestamp: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setCurrentTask(newTask);
    setShowAgent(false);
    setMode('task-details');
    setObservation('');
    setImage(null);
    setMetrics(prev => ({
      ...prev,
      activeTasks: prev.activeTasks + 1,
      totalInteractions: prev.totalInteractions + 1
    }));
  };

  // Show AgentMission overlay when triggered
  if (showAgent && observation) {
    return (
      <Layout mode={mode} setMode={setMode}>
        <AgentMission
          observation={observation}
          image={image || undefined}
          onComplete={handleAgentComplete}
          onCancel={() => setShowAgent(false)}
        />
      </Layout>
    );
  }

  return (
    <Layout mode={mode} setMode={setMode}>
      {mode === 'home' && renderHome()}
      {mode === 'initiate' && renderInitiate()}
      {mode === 'resonate' && renderResonate()}
      {mode === 'task-details' && renderTaskDetails()}
      {mode === 'echo' && <Echo echoes={echoes} onAddEcho={handleAddEcho} />}
      {mode === 'admin' && <AdminDashboard metrics={metrics} tasks={tasks} />}
    </Layout>
  );
};

export default App;

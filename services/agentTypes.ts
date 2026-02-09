
// Agent Types for Marathon Agent Architecture
import { Task, Location } from '../types';

export interface ToolCall {
    id: string;
    name: 'get_location' | 'get_weather' | 'analyze_photo' | 'get_time' | 'search_nearby';
    input: Record<string, any>;
    output?: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    timestamp: number;
}

export interface AgentThought {
    id: string;
    type: 'reasoning' | 'planning' | 'tool_call' | 'verification' | 'adaptation';
    content: string;
    timestamp: number;
}

export interface AgentState {
    missionId: string;
    currentStep: number;
    totalSteps: number;
    thoughts: AgentThought[];
    toolCalls: ToolCall[];
    context: {
        location?: { lat: number; lng: number; address: string };
        weather?: { condition: string; temperature: number; isOutdoorSafe: boolean };
        time?: { hour: number; isDaytime: boolean; isWeekend: boolean };
        observations: string[];
    };
    status: 'planning' | 'executing' | 'verifying' | 'adapting' | 'completed' | 'failed';
}

export interface VerificationResult {
    isComplete: boolean;
    confidence: number;
    feedback: string;
    detectedElements: string[];
    suggestedNextAction?: string;
}

export interface MissionPlan {
    id: string;
    title: string;
    problem: string;
    steps: MissionStep[];
    secretCode: string;
    adaptations: string[];
    estimatedDuration: string;
}

export interface MissionStep {
    id: string;
    role: 'initiator' | 'resonator';
    action: string;
    verificationCriteria: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    completionPhoto?: string;
    verificationResult?: VerificationResult;
}

export type AgentEvent =
    | { type: 'thought'; thought: AgentThought }
    | { type: 'tool_start'; tool: ToolCall }
    | { type: 'tool_complete'; tool: ToolCall }
    | { type: 'step_complete'; stepId: string }
    | { type: 'mission_complete'; missionId: string }
    | { type: 'adaptation'; reason: string; newPlan: Partial<MissionPlan> };

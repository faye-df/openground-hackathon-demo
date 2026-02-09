
import { GoogleGenAI, Type } from "@google/genai";
import {
    AgentState,
    AgentThought,
    ToolCall,
    MissionPlan,
    MissionStep,
    VerificationResult,
    AgentEvent
} from './agentTypes';
import { tools, ToolName } from './tools';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

type EventCallback = (event: AgentEvent) => void;

export class MissionAgent {
    private state: AgentState;
    private onEvent: EventCallback;

    constructor(missionId: string, onEvent: EventCallback) {
        this.onEvent = onEvent;
        this.state = {
            missionId,
            currentStep: 0,
            totalSteps: 0,
            thoughts: [],
            toolCalls: [],
            context: { observations: [] },
            status: 'planning'
        };
    }

    private addThought(type: AgentThought['type'], content: string) {
        const thought: AgentThought = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content,
            timestamp: Date.now()
        };
        this.state.thoughts.push(thought);
        this.onEvent({ type: 'thought', thought });
        return thought;
    }

    private async executeTool<T extends ToolName>(name: T, input: Parameters<typeof tools[T]>[0]): Promise<ReturnType<typeof tools[T]>> {
        const toolCall: ToolCall = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            input: input as Record<string, any>,
            status: 'running',
            timestamp: Date.now()
        };

        this.state.toolCalls.push(toolCall);
        this.onEvent({ type: 'tool_start', tool: toolCall });

        try {
            const result = await (tools[name] as any)(input);
            toolCall.output = result;
            toolCall.status = 'completed';
            this.onEvent({ type: 'tool_complete', tool: { ...toolCall } });
            return result;
        } catch (error) {
            toolCall.status = 'failed';
            this.onEvent({ type: 'tool_complete', tool: { ...toolCall } });
            throw error;
        }
    }

    async planMission(observation: string, imageBase64?: string): Promise<MissionPlan> {
        this.state.status = 'planning';

        // Step 1: Gather context through tool calls
        this.addThought('reasoning', 'Analyzing observation and gathering environmental context...');

        // Get location
        this.addThought('tool_call', 'Checking location context...');
        const location = await this.executeTool('get_location', { query: observation });
        this.state.context.location = location;

        // Get weather
        this.addThought('tool_call', 'Checking weather conditions...');
        const weather = await this.executeTool('get_weather', { lat: location.lat, lng: location.lng });
        this.state.context.weather = weather;

        // Get time context
        this.addThought('tool_call', 'Analyzing optimal timing...');
        const time = await this.executeTool('get_time', {});
        this.state.context.time = time;

        // Search nearby resources
        this.addThought('tool_call', 'Searching for nearby resources...');
        const nearby = await this.executeTool('search_nearby', {
            lat: location.lat,
            lng: location.lng,
            query: 'community spaces'
        });

        // Step 2: Generate adaptive mission plan using Gemini
        this.addThought('planning', 'Synthesizing context and generating adaptive mission plan...');

        const contextSummary = `
      Location: ${location.address}
      Weather: ${weather.condition}, ${weather.temperature}°C, Outdoor safe: ${weather.isOutdoorSafe}
      Time: ${time.formattedTime}, Daytime: ${time.isDaytime}, Weekend: ${time.isWeekend}
      Nearby: ${nearby.places.map(p => p.name).join(', ')}
    `;

        const plan = await this.generateAdaptivePlan(observation, contextSummary, imageBase64);

        this.state.totalSteps = plan.steps.length;
        this.state.status = 'executing';

        this.addThought('reasoning', `Mission planned with ${plan.steps.length} steps. Adaptations ready for: ${plan.adaptations.join(', ')}`);

        return plan;
    }

    private async generateAdaptivePlan(observation: string, context: string, imageBase64?: string): Promise<MissionPlan> {
        const model = 'gemini-3-flash-preview';

        const systemInstruction = `
      You are the Mission Agent for Open Ground (共鸣场), an autonomous urban mission orchestrator.
      
      Your role: Generate ADAPTIVE multi-step missions that:
      1. Respond to real environmental conditions (weather, time, location)
      2. Create meaningful physical collaboration between strangers
      3. Include verification criteria for each step
      4. Anticipate possible adaptations if conditions change
      
      Context-Aware Rules:
      - If weather is unsafe → suggest indoor alternatives
      - If nighttime → focus on well-lit areas or next-day scheduling
      - If weekend → leverage higher foot traffic
      - Use nearby places as mission anchors
      
      Output a mission with 2-3 clear steps, each with:
      - Specific action
      - How to verify completion (what photo should show)
      - Role assignment (initiator or resonator)
    `;

        const parts: any[] = [{
            text: `Observation: ${observation}\n\nEnvironmental Context:\n${context}\n\nGenerate an adaptive mission plan.`
        }];

        if (imageBase64) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.split(',')[1] || imageBase64
                }
            });
        }

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        problem: { type: Type.STRING },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    action: { type: Type.STRING },
                                    verificationCriteria: { type: Type.STRING },
                                    status: { type: Type.STRING }
                                },
                                required: ["id", "role", "action", "verificationCriteria", "status"]
                            }
                        },
                        secretCode: { type: Type.STRING },
                        adaptations: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        estimatedDuration: { type: Type.STRING }
                    },
                    required: ["title", "problem", "steps", "secretCode", "adaptations", "estimatedDuration"]
                }
            }
        });

        const plan = JSON.parse(response.text || '{}');
        plan.id = this.state.missionId;
        return plan as MissionPlan;
    }

    async verifyStepCompletion(stepId: string, photoBase64: string): Promise<VerificationResult> {
        this.state.status = 'verifying';
        this.addThought('verification', `Analyzing completion photo for step ${stepId}...`);

        const model = 'gemini-3-flash-preview';

        const systemInstruction = `
      You are verifying mission step completion for Open Ground.
      
      Analyze the submitted photo and determine:
      1. Is the task visibly completed?
      2. What elements in the photo indicate completion?
      3. Confidence level (0-100)
      4. Constructive feedback
      
      Be encouraging but accurate. If incomplete, suggest what's missing.
    `;

        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: `Verify if this photo shows task completion. Step verification criteria: "Show the completed action"` },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: photoBase64.split(',')[1] || photoBase64
                        }
                    }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isComplete: { type: Type.BOOLEAN },
                        confidence: { type: Type.NUMBER },
                        feedback: { type: Type.STRING },
                        detectedElements: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        suggestedNextAction: { type: Type.STRING }
                    },
                    required: ["isComplete", "confidence", "feedback", "detectedElements"]
                }
            }
        });

        const result = JSON.parse(response.text || '{}') as VerificationResult;

        if (result.isComplete) {
            this.addThought('verification', `✓ Step verified! Confidence: ${result.confidence}%. ${result.feedback}`);
            this.state.currentStep++;
            this.onEvent({ type: 'step_complete', stepId });

            if (this.state.currentStep >= this.state.totalSteps) {
                this.state.status = 'completed';
                this.onEvent({ type: 'mission_complete', missionId: this.state.missionId });
            }
        } else {
            this.addThought('verification', `Step not yet complete. ${result.feedback}`);
            this.state.status = 'executing';
        }

        return result;
    }

    async adaptMission(reason: string, currentPlan: MissionPlan): Promise<MissionPlan> {
        this.state.status = 'adapting';
        this.addThought('adaptation', `Conditions changed: ${reason}. Adapting mission...`);

        // Re-check environmental conditions
        const weather = await this.executeTool('get_weather', {
            lat: this.state.context.location?.lat || 0,
            lng: this.state.context.location?.lng || 0
        });

        this.state.context.weather = weather;

        const model = 'gemini-3-flash-preview';

        const response = await ai.models.generateContent({
            model,
            contents: `
        Current mission: ${JSON.stringify(currentPlan)}
        Change reason: ${reason}
        New weather: ${JSON.stringify(weather)}
        
        Adapt the mission to handle this change while preserving the core goal.
        Keep the same structure but modify actions as needed.
      `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        problem: { type: Type.STRING },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    action: { type: Type.STRING },
                                    verificationCriteria: { type: Type.STRING },
                                    status: { type: Type.STRING }
                                }
                            }
                        },
                        secretCode: { type: Type.STRING },
                        adaptations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        estimatedDuration: { type: Type.STRING }
                    }
                }
            }
        });

        const adaptedPlan = JSON.parse(response.text || '{}') as MissionPlan;
        adaptedPlan.id = this.state.missionId;

        this.addThought('adaptation', `Mission adapted successfully. New approach: ${adaptedPlan.title}`);
        this.onEvent({ type: 'adaptation', reason, newPlan: adaptedPlan });

        this.state.status = 'executing';
        return adaptedPlan;
    }

    getState(): AgentState {
        return { ...this.state };
    }
}

// Export a factory function for creating agents
export function createMissionAgent(missionId: string, onEvent: EventCallback): MissionAgent {
    return new MissionAgent(missionId, onEvent);
}

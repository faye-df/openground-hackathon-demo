
// Mock Tool Implementations for Demo
// In production, these would call real APIs

export const tools = {
    async get_location(input: { query?: string }): Promise<{ lat: number; lng: number; address: string }> {
        // Simulate API delay
        await delay(800);
        // Return mock location (San Francisco for demo)
        return {
            lat: 37.7749,
            lng: -122.4194,
            address: input.query || "Mission District, San Francisco, CA"
        };
    },

    async get_weather(input: { lat: number; lng: number }): Promise<{
        condition: string;
        temperature: number;
        isOutdoorSafe: boolean;
        humidity: number;
    }> {
        await delay(600);
        // Simulate varying conditions for demo
        const conditions = ['sunny', 'cloudy', 'light_rain', 'clear'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        const temperature = 15 + Math.floor(Math.random() * 15);

        return {
            condition,
            temperature,
            isOutdoorSafe: condition !== 'light_rain' && temperature > 10,
            humidity: 40 + Math.floor(Math.random() * 30)
        };
    },

    async get_time(input: { timezone?: string }): Promise<{
        hour: number;
        isDaytime: boolean;
        isWeekend: boolean;
        formattedTime: string;
    }> {
        await delay(300);
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();

        return {
            hour,
            isDaytime: hour >= 6 && hour <= 20,
            isWeekend: day === 0 || day === 6,
            formattedTime: now.toLocaleTimeString()
        };
    },

    async search_nearby(input: { lat: number; lng: number; query: string }): Promise<{
        places: Array<{ name: string; distance: string; type: string }>;
    }> {
        await delay(700);
        // Mock nearby places
        return {
            places: [
                { name: "Dolores Park", distance: "0.3 mi", type: "park" },
                { name: "Community Garden", distance: "0.5 mi", type: "garden" },
                { name: "Valencia Street Mural", distance: "0.2 mi", type: "art" }
            ]
        };
    }
};

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type ToolName = keyof typeof tools;

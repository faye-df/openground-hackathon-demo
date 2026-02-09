
// Tool Implementations - Using Browser APIs and Free Services

export const tools = {
    async get_location(input: { query?: string }): Promise<{ lat: number; lng: number; address: string }> {
        // 使用浏览器原生 Geolocation API（免费，无需 API Key）
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                // 如果浏览器不支持，返回默认位置
                resolve({
                    lat: 37.7749,
                    lng: -122.4194,
                    address: input.query || "Location unavailable"
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // 使用免费的 OpenStreetMap Nominatim 反向地理编码
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
                            { headers: { 'Accept-Language': 'zh-CN,en' } }
                        );
                        const data = await response.json();
                        const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

                        resolve({ lat, lng, address });
                    } catch {
                        resolve({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
                    }
                },
                (error) => {
                    console.warn('Geolocation error:', error.message);
                    // 定位失败时返回默认位置
                    resolve({
                        lat: 37.7749,
                        lng: -122.4194,
                        address: input.query || "Location access denied"
                    });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    },

    async get_weather(input: { lat: number; lng: number }): Promise<{
        condition: string;
        temperature: number;
        isOutdoorSafe: boolean;
        humidity: number;
    }> {
        // 使用免费的 Open-Meteo API（无需 API Key）
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${input.lat}&longitude=${input.lng}&current=temperature_2m,relative_humidity_2m,weather_code`
            );
            const data = await response.json();

            const weatherCode = data.current?.weather_code || 0;
            const temperature = Math.round(data.current?.temperature_2m || 20);
            const humidity = data.current?.relative_humidity_2m || 50;

            // 将 WMO 天气代码转换为简单描述
            const condition = weatherCode <= 3 ? 'clear' :
                weatherCode <= 48 ? 'cloudy' :
                    weatherCode <= 67 ? 'rain' : 'stormy';

            return {
                condition,
                temperature,
                isOutdoorSafe: weatherCode < 50 && temperature > 5 && temperature < 35,
                humidity
            };
        } catch {
            // API 失败时返回默认值
            return {
                condition: 'clear',
                temperature: 20,
                isOutdoorSafe: true,
                humidity: 50
            };
        }
    },

    async get_time(input: { timezone?: string }): Promise<{
        hour: number;
        isDaytime: boolean;
        isWeekend: boolean;
        formattedTime: string;
    }> {
        // 使用浏览器本地时间（真实数据）
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
        // 使用免费的 OpenStreetMap Nominatim 搜索附近地点
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input.query)}&lat=${input.lat}&lon=${input.lng}&limit=5&addressdetails=1`,
                { headers: { 'Accept-Language': 'zh-CN,en' } }
            );
            const data = await response.json();

            const places = data.slice(0, 3).map((place: any, index: number) => ({
                name: place.display_name?.split(',')[0] || `Place ${index + 1}`,
                distance: `${(Math.random() * 0.5 + 0.1).toFixed(1)} mi`,
                type: place.type || 'place'
            }));

            return {
                places: places.length > 0 ? places : [
                    { name: "Nearby Park", distance: "0.3 mi", type: "park" },
                    { name: "Community Space", distance: "0.5 mi", type: "community" }
                ]
            };
        } catch {
            // API 失败时返回默认值
            return {
                places: [
                    { name: "Nearby Park", distance: "0.3 mi", type: "park" },
                    { name: "Community Space", distance: "0.5 mi", type: "community" }
                ]
            };
        }
    }
};



export type ToolName = keyof typeof tools;

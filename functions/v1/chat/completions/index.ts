export async function onRequest({ request }) {

    request.headers.delete('accept-encoding');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
    };

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    const body = await request.json();

    if (body.stream === true) {
        const upstreamResponse = await fetch('https://cnb.cool/ai/chat/completions', {
            method: 'POST',
            body: body,
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            eo: {
                timeoutSetting: {
                    connectTimeout: 300000,
                    readTimeout: 300000,
                    writeTimeout: 300000,
                }
            }
        });

        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            headers: {
                'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/octet-stream',
                'Cache-Control': 'no-store',
                ...corsHeaders
            },
        });
    }else{
        body.stream = true;
        const upstreamResponse = await fetch('https://cnb.cool/ai/chat/completions', {
            method: 'POST',
            body: JSON.stringify(body),
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // 读取stream响应内容
        const reader = upstreamResponse.body.getReader();
        let result = '';
        let done = false;
        const decoder = new TextDecoder('utf-8');
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
                result += decoder.decode(value, { stream: !done });
            }
        }
        // 解析event-stream格式，拼接data内容
        const lines = result.split('\n');
        let fullContent = '';
        for (const line of lines) {
            if (line.startsWith('data:')) {
                const data = line.replace('data:', '').trim();
                if (data === '[DONE]') continue;
                try {
                    const json = JSON.parse(data);
                    fullContent += json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || '';
                } catch (e) {
                    // 忽略解析错误
                }
            }
        }
        // 构造仿OpenAI响应格式
        const promptString = Array.isArray(body.messages) ? body.messages.map(m => m.content || '').join('') : '';
        const promptLen = promptString.length;
        const completionLen = fullContent.length;
        const fakeResponse = {
            id: 'chatcmpl-' + Math.random().toString(16).slice(2),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: body.model || 'unknown',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        reasoning_content: null,
                        content: fullContent,
                        tool_calls: []
                    },
                    logprobs: null,
                    finish_reason: 'stop',
                    stop_reason: null
                }
            ],
            usage: {
                prompt_tokens: promptLen,
                total_tokens: promptLen + completionLen,
                completion_tokens: completionLen,
                prompt_tokens_details: null
            },
            prompt_logprobs: null
        };
        return new Response(JSON.stringify(fakeResponse), {
            status: upstreamResponse.status,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
                ...corsHeaders
            },
        });
    }
}

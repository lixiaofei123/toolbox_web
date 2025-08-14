export async function onRequest({ request }) {


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


    const upstreamResponse = await fetch('https://cnb.cool/ai/chat/completions', {
        method: 'POST',
        body: request.body,
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
}

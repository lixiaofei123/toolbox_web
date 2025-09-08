import { headers } from "next/headers";


export async function onRequest({ request,params }) {
    const key = params.key

    let value = await dwz.get(key);
    if(value === null){
        return Response(JSON.stringify({ data: '短网址不存在' }),{ status: 400});
    }

    return Response("", { status: 301, headers: {
        'Location': value
    }})
}
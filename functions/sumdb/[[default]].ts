
const prefix = "/sumdb/";

export async function onRequest({ request }) {

    const srcurl = request.url;
    const { pathname } = new URL(srcurl);
    const subpath = pathname.slice(prefix.length)
    const response = await fetch(`https://${subpath}`);
    return response

}

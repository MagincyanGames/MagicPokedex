export function Link(link: string) {
    if (link.startsWith('/')) {
        return import.meta.env.BASE_URL + link.substring(1, link.length)
    }
    else return link
}

export async function FetchLink(link: string) {
    return fetch(Link(link));
}
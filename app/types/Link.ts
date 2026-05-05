let BASE_URL = ''
try {
  BASE_URL = import.meta.env.BASE_URL || ''
} catch (e) {
  // import.meta.env no disponible en Node.js
  BASE_URL = ''
}

export function Link(link: string) {
    if (link.startsWith('/')) {
        return BASE_URL + link.substring(1, link.length)
    }
    else return link
}

export async function FetchLink(link: string) {
    return fetch(Link(link));
}

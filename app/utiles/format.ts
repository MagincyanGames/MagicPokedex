/**
 * Capitaliza la primera letra de cada palabra en una cadena de texto
 * @param text - Texto a capitalizar
 * @returns Texto con la primera letra de cada palabra en mayúscula
 */
export function capitalize(text: string): string {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

export function BuildQuery(map: any) {
    const params = new URLSearchParams();

    for (let key in map) {
        const value = map[key]

        if (value)
            params.append(key, value)
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
};


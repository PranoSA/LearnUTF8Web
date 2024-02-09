/*

*/

// Cache Information About Characters Here 


type CharacterCache  = {
    [key: string]: string
}

const characterCache: CharacterCache = {};

const getByName = (name: string): string  | null => {
    if(characterCache[name]) {
        return characterCache[name]
    }
    return null
}

const setByName = (name: string, value: string) => {
    characterCache[name] = value
}

export { getByName, setByName }
import { Buffer } from "buffer";
import { getByName, setByName } from "./common_fetch";

const base_url_api = `${import.meta.env.VITE_REACT_APP_API_URL}/unicode/`;

type Utf32Addup = {
    two_byte_hex : string, 
    two_byte_bin :  string,
    value : number,
    result : string,
    multiplier: number,
    accumulation_hex : string,
    accumulation_dec : string,
}

type Utf32Examination = {
    position : number, 
    codePoint: string,
    numBytes: number,
    grapheme: number,
    characterString : string,
    characterName: string,
    hexRepresentation: string,
    addUps : Utf32Addup[],
}

function analyzeCodePointByteArrayUtf32(byteArray: Buffer):Utf32Addup[]{

    const value = byteArray[3]*0x1000000 + byteArray[2]*0x10000 + byteArray[1]*0x100 + byteArray[0]

    return [{
        two_byte_hex : value.toString(16).padStart(4,'0'), 
        two_byte_bin :  value.toString(2).padStart(10,'0'),
        value : value,
        result : value.toString(16).padStart(4,'0'),
        multiplier: 1,
        accumulation_hex : value.toString(16).padStart(4,'0'),
        accumulation_dec : value.toString(10).padStart(4,'0'),
    }]
    
}

async function analyzeUtf32String(buffer:Buffer) :Promise<Utf32Examination[]> {
    const utf32Examinations:Utf32Examination[] = []

    for(let position = 0; position < buffer.length; position+=4){
        
        console.log(buffer)
        console.log(position + " : ?")


        const codePoint = buffer[3+position]*0x1000000 + buffer[2+position]*0x10000 + buffer[1+position]*0x100 + buffer[position]
        const numBytes = 4
        const grapheme = 1
        const characterString = String.fromCodePoint(codePoint)
        let characterName = ""

        if(codePoint == undefined){return [];}

        const cachedCharacter = getByName(String.fromCodePoint(codePoint))

        if(codePoint == 32){
            characterName = "space"
          }
    
  
        else if (cachedCharacter){
            characterName = cachedCharacter
        }
        else {
        
            try{
            //const res = await fetch(base_url_api + codePoint.toString(16));
            //The Actual Character
            const res = await fetch(base_url_api + String.fromCodePoint(codePoint))
    
            const body = await res.json();
    
            //characterName = body.na;
            characterName = body.unicode_name;

            setByName(String.fromCodePoint(codePoint), characterName)


    
            }catch(e){
            console.error(e)
            }
        }

        //const hexRepresentation = buffer.slice(position,position+4).toString("hex").padStart(8,'0')
        const addUps = analyzeCodePointByteArrayUtf32(buffer.slice(position,position+4))

        const byteArray = buffer.slice(position,position+4)

        const value = byteArray[3]*0x1000000 + byteArray[2]*0x10000 + byteArray[1]*0x100 + byteArray[0]


        utf32Examinations.push({
            position, 
            codePoint  : codePoint.toString(16),
            numBytes,
            grapheme,
            characterString,
            characterName,
            hexRepresentation : value.toString(16).padStart(4,'0'),
            addUps,
        })
    }

    return utf32Examinations
}


export {analyzeUtf32String}
export type { Utf32Examination, Utf32Addup}
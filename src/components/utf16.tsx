/* eslint-disable @typescript-eslint/no-unused-vars */
import { getByName, setByName } from "./common_fetch";



const base_url_api = `${import.meta.env.VITE_REACT_APP_API_URL}/unicode/`;

import { Buffer } from "buffer";


/*
    Represents the Maximum Value for the preceeding bytes of a 2 string UTF-8 sequence
*/



type Utf8Examination = {
    position : number, 
    codePoint: string,
    numBytes: number,
    grapheme: number,
    characterString : string,
    characterName: string,
    hexRepresentation: string,
    addUps : UTF8Addup[]
}

type UTF8Addup = {
    byte_hex : string, 
    byte_bin :  string,
    byte_mask : string, 
    value : number,
    multiplier : number,
    result : string,
    accumulation_hex : string,
    accumulation_dec : string,
}

type UtfAddup = UTF8Addup

type UtfExamination = Utf8Examination

type Utf16Addup = {
    two_byte_hex : string, 
    two_byte_bin :  string,
    surrogate_mask : string, 
    value : number,
    result : string,
    multiplier: number,
    accumulation_hex : string,
    accumulation_dec : string,
    surrogate_addup : number,
}

type Utf16Examination = {
    position : number, 
    codePoint: string,
    numBytes: number,
    grapheme: number,
    characterString : string,
    characterName: string,
    hexRepresentation: string,
    addUps : Utf16Addup[],
}

/*
  Given The Number of Bytes in the UTF-8 Sequence, and the Buffer,

  Analyze a Single CodePoint ???
*/
function analyzeCodePointByteArrayUtf16(byteArray: Buffer, codePoints:number):Utf16Addup[]{

    // How Many Values

    const newBuffer = Buffer.from(byteArray)
    newBuffer.reverse()


    if(codePoints == 1){
      return [{
        two_byte_hex : byteArray.slice(1,2).toString('hex').padStart(4,'0') + byteArray.slice(0,1).toString('hex').padStart(4,'0'),
        two_byte_bin :  byteArray[1].toString(2).padStart(8,'0')+byteArray[0].toString(2).padStart(8,'0'),
        surrogate_mask : '0000000000000000',
        value : byteArray[1]*0x100 + byteArray[0],
        result : (byteArray[1]*0x100 + byteArray[0]).toString(10),
        multiplier : 1,
        accumulation_hex :  (byteArray[1]*0x100 + byteArray[0]).toString(16),
        accumulation_dec :  (byteArray[1]*0x100 + byteArray[0]).toString(10),
        surrogate_addup : 0
      }]
      
    }


    else if(codePoints == 2){
      //Apply The Mask Really

      // Remove the Surrogate Mask, only encode 10 bits



      const first_surrogate_value = ((0x3 & byteArray[1])&0x3FF)*0x100 + byteArray[0] 

      const second_surrogate_value = ((0x3 & byteArray[3])*0x100 + byteArray[2])
      //const multiplier = 0x400 // 2^10 = 1024
      // Also, Add 2^16 to the total value at the end to get the actual code point

      // Not Sure How I should ressemble the 2^16 in the addup array
      console.log(byteArray);
      return [{
          two_byte_hex : byteArray.slice(1,2).toString('hex').padStart(2,'0') + byteArray.slice(0,1).toString('hex').padStart(2,'0'),
          two_byte_bin :  byteArray[1].toString(2).padStart(8,'0')+byteArray[0].toString(2).padStart(8,'0'),
          surrogate_mask : 'xxxxxx0000000000',
          value : first_surrogate_value,
          result : (first_surrogate_value*0x400).toString(10),
          multiplier : 0x400,
          accumulation_hex :  (first_surrogate_value*0x400).toString(16),
          accumulation_dec :  (first_surrogate_value*0x400).toString(10),
          surrogate_addup : 0
      }, {
        two_byte_hex : byteArray.slice(3,4).toString('hex').padStart(2,'0') + byteArray.slice(2,3).toString('hex').padStart(2,'0'),
        two_byte_bin : byteArray[3].toString(2).padStart(8,'0')+byteArray[2].toString(2).padStart(8,'0'), 
        surrogate_mask : 'xxxxxx0000000000',
        value : second_surrogate_value,
        multiplier : 1,
        result : (second_surrogate_value).toString(10),
        accumulation_hex :  (first_surrogate_value*0x400 + second_surrogate_value ).toString(16) + " + 0x10000 = " + (first_surrogate_value*0x400 + second_surrogate_value + 0x10000).toString(16),
        accumulation_dec :  (first_surrogate_value*0x400 + second_surrogate_value ).toString(10) + "     (2^16 Offset)",
        surrogate_addup : 0x10000 // 2^16
      }]
    }

    else {
      throw new Error("Only 2 byte UTF-16 Sequences are supported")
    }
    //First Byte?? 

}


async function analyzeUtf16String(buffer:Buffer) :Promise<Utf16Examination[]> {
    // Iterate through the Buffer

    const examinations : Utf16Examination[] = []

    let which_grapheme = 0

    let numTwoBytes = 1 ;

    console.log(buffer.length)
    for (let i = 0; i < buffer.length;) {
        /**
        
        1.  Find Number of Byte in utf-16 Sequence

        2.  Get the UTF-16 Sequence

        3.  Convert to Code Point
        */
      which_grapheme++
    
      // Get the first two bytes of the UTF-16 sequence
      //const firstTwoByte = [buffer[i+3], buffer[i+2]];

     /*
      Check if First Bytes is part of surrogate pair

      First Byte is between 0xD800 and 0xDBFF
      */
     const firstCodePointValue = buffer[i+1] * 0x100 + buffer[i]

     console.log(buffer);

     console.log(firstCodePointValue);  // 

     if(firstCodePointValue >= 0xD800 && firstCodePointValue <= 0xDBFF){
       numTwoBytes = 2
        console.log(i)
       //Make Sure 2nd Of Pair si between 0xDC00 and 0xDFFF
        const secondByte = [buffer[i+3], buffer[i+2]];
        const secondByteValue = secondByte[0] * 0x100 + secondByte[1]

        console.log(firstCodePointValue.toString(16))
        console.log(secondByteValue.toString(16))

        if(!(secondByteValue >= 0xDC00 && secondByteValue <= 0xDFFF)){
          console.error(`Invalid UTF-16 sequence at position ${i}, not 2nd part of pair`);
          break;
        }
     }

     //Make Sure its not the encoding for 2nd surrogate pair, this is not valid
     //Can't be Between 0xDC00 and 0xDFFF
     if(firstCodePointValue >= 0xDC00 && firstCodePointValue <= 0xDFFF){
       console.error("First of Pair is encoded as second of surrogate pair");
     }

      // Get the UTF-16 sequence
      const utf16Sequence = buffer.slice(i, i + 2*numTwoBytes);

      const codePoint = utf16Sequence.toString('utf16le').codePointAt(0);

      // Print the hexadecimal representation of the code point
      //Print out the binary representation with a multiple of 8 characters to see first 0s instead of omitting them


      //Fetch From the API at codepoints.net at base_url + "codePoint.toString(16)", and get the .na in the json document

      let characterName = ""

      if(codePoint == undefined){return [];}

      const cachedCharacter = getByName(String.fromCodePoint(codePoint));

      if(cachedCharacter != null){
        characterName = cachedCharacter
      }

      else {
        try{
          //const res = await fetch(base_url_api + codePoint.toString(16));
          //The Actual Character
         const res = await fetch(base_url_api + String.fromCodePoint(codePoint))
    
          const body = await res.json();
    
          characterName = body.na;
          //characterName = body.unicode_name;
          setByName(String.fromCodePoint(codePoint), characterName)
    
          }catch(e){
            console.error(e)
          }    
      }

    

      //console.log(`Code Point at position ${i}: U+${codePoint.toString(16)},   Number Bytes ${numBytes}, Grapheme ${which_grapheme} : ${String.fromCodePoint(codePoint)} : (${characterName})`);

      //console.log(`\t Raw Hexdecimal Representation: ${subArray.toString('hex').padStart(2*numBytes, '0')} \n`)
      //console.log("Byte By Byte Calculation")
      const subArray : Buffer = Buffer.from([])
      if(numTwoBytes == 2){
        subArray[0] = buffer[i+1]
        subArray[1] = buffer[i]
        subArray[2] = buffer[i+3]
        subArray[3] = buffer[i+2]
      }
      else{
        subArray[0] = buffer[i+1]
        subArray[1] = buffer[i]
      }

      //const subArray = buffer.slice(i, i + 2*numTwoBytes);

   const newBuffer= Buffer.from(buffer.slice(i, i + 2*numTwoBytes))
    let NewHexRepresentation = "";
   
    for(let j = 0; j < numTwoBytes; j++){
      
     NewHexRepresentation +=newBuffer.slice(j*2, j*2+2).reverse().toString('hex').padStart(2*numTwoBytes, '0') 
    }


     examinations.push({
        position : i, 
        numBytes: 2*numTwoBytes,
        grapheme: which_grapheme,
        codePoint: codePoint.toString(16),
        characterName,
        characterString: String.fromCodePoint(codePoint),
        hexRepresentation : NewHexRepresentation,
        //hexRepresentation:buffer.slice(i,i+2*numTwoBytes).toString('hex').padStart(2*numTwoBytes, '0'),
        addUps: analyzeCodePointByteArrayUtf16(buffer.slice(i,i+2*numTwoBytes), numTwoBytes)
     })

     console.log('i')
     console.log(numTwoBytes)
      // Move to the next position in the Buffer
      console.log(i)
      i += 2*numTwoBytes;

      numTwoBytes = 1
    }
    
    

    

    return examinations
}

export type {Utf16Examination, Utf16Addup}
export {analyzeUtf16String, analyzeCodePointByteArrayUtf16}
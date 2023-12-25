/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {} from './utf8'
import { analyzeUtf8String, Utf8Examination } from './utf8'
//import { Buffer } from 'buffer'
import {Buffer} from 'buffer';


type ApplicationType = {
    appid : string
    name : string 
    created_at : string 
    updated_at : string
    description : string
    conversions : enumeratedConversion[]
}

type enumeratedConversion = {
    value : string 
}





//Application Component
const Application = () => {
    const { applicationId } = useParams<{ applicationId: string }>()
    const [application, setApplication] = useState<ApplicationType | null>(null)
    const [ stringAnalyzed, setStringAnalyzed ] = useState<Utf8Examination [][]>([])


    useEffect(() => {
        const fetchApplication = async () => {
            const response = await fetch(`http://localhost:8080/applications/${applicationId}`)
            const data = await response.json()
            setApplication(data)
        }
        try {
        fetchApplication()
        }
        catch(e){
            setApplication ({
                appid : "0",
                name : "Error",
                created_at : "Error",
                updated_at : "Error",
                description : "Error",
                conversions : [],
            })
            console.log(e)
        }
    }, [applicationId])

    if (!application) {
        setApplication ({
            appid : "0",
            name : "Error",
            created_at : "Error",
            updated_at : "Error",
            description : "Error",
            conversions : [],
        })
        //return <div>Loading...</div>
    }

    if(!application){
        return <div> </div>
    }

    // Save Application by Postings To Saved Endpoint
    const saveApplication = async () => {
        //Fetch Application From https://${process.env.REACT_APP_API_URL}/applications/${applicationId}
        //Post Application to https://${process.env.REACT_APP_API_URL}/saved/${applicationId}
        
        const response = await fetch(`http://${import.meta.env.VITE_REACT_APP_API_URL}/applications/${applicationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(application)
        })
         await response.json()
    }


    //Add A Prop That is a function that can be called to modify the the conversion value
    //For that conversion, then call the function with the new value
    //from the increment and decrement functionality
    const AnalyzePanel =  (analyzedString:Utf8Examination, index:number) => {


        /*
            Flex Size = 4 in Large, 6 in Medium, 12 in Small
            Space Around = Max
            Space Between = Max
            Align Items = Center
            Justify Content = Center
            Direction = Row
            Wrap = noWrap 

        */

        /*
            Display 
            Code point at Position 0: Code Point
            Number of Bytes : numBytes
            Grapheme #: Grapheme
            textRepresentation : chracterRepresentation
            Name: characterName
            Raw Hex Representation: hexRepresentation
            
            for each    addUp : addUps
                byte_hex : byte_bin
                byte_dec(byte_mask) * multiplier = result 
                Calculated Decimal Value = result_hexadecimal


            Add a button that decrements the position by 1 and displays the new analyzedString
            Add a button that increments the position by 1 and displays the new analyzedString

            You would need to reanalyze the string to get the new analyzedString

            Add a Button That Ups the U+ Value For that codepoint instead of the byte 
        */

        return (
            <div>
                
                <div>Code point at Position {analyzedString.position}:U+{analyzedString.codePoint}</div>
                <div>Number of Bytes : {analyzedString.numBytes}</div>
                <div>Grapheme #: {analyzedString.grapheme}</div>
                <div>textRepresentation : {analyzedString.characterString}</div>
                <div>Name: {analyzedString.characterName}</div>
                <div>Raw Hex Representation: {analyzedString.hexRepresentation}</div>


                <div>for each    addUp : {analyzedString.addUps.map((addup, pos) => {
                    return (
                        <div>
                        <div> byte : {pos} </div>
                        <div>byte_hex : {addup.byte_hex}</div>
                        <div>byte_bin : {addup.byte_bin}</div>
                        <div>byte_dec : {addup.byte_mask} * {addup.multiplier} = {addup.result}</div>
                        <div> accumulation : hex-{addup.accumulation_hex} dec-{addup.accumulation_dec} </div>
                        <button onClick={
                            async () => {
                                
                                const newApplication = {...application}
                                //How To Decrement The Value
                                const currentBytes = Buffer.from(newApplication.conversions[index].value)
                                currentBytes[pos+analyzedString.position]++;
                                //Get the String 
                                const new_string = currentBytes.toString('utf-8')
                                newApplication.conversions[index].value = new_string
                                setApplication(newApplication)
                                const newState = await analyzeUtf8String(currentBytes)
                                //Only Change This Index in the derivedState
                                setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
                            }
                        }>
                            Increment Byte </button>
                            <button onClick={
                            async () => {
                                
                                const newApplication = {...application}
                                //How To Decrement The Value
                                const currentBytes = Buffer.from(newApplication.conversions[index].value)
                                currentBytes[pos+analyzedString.position]--;
                                //Get the String 
                                const new_string = currentBytes.toString('utf-8')
                                newApplication.conversions[index].value = new_string
                                setApplication(newApplication)
                                const newState = await analyzeUtf8String(currentBytes)
                                //Only Change This Index in the derivedState
                                setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
                            }
                        }>
                            Decrement Byte 
                        </button>
                        </div>
                    )
                })}</div>

            </div>
        )

    }


    const ApplicationDisplay = () => {

                /*
            Flex Size = 4 in Large, 6 in Medium, 12 in Small
            Space Around = Max
            Space Between = Max
            Align Items = Center
            Justify Content = Center
            Direction = Row
            Wrap = noWrap 


            Map application.conversions to a list of Display Panels With

            Text Box Input For Character String 

            Sets application.conversions[index] to the value of the input box

            Displays the value of application.conversions[index] in the Display Panel

            Displays the value of the string, converted to byte array, then converted using
            toString(16) for a hexedecimal representation of the bytes making up the string

        

        //Use analyzeUtf8String to analyze the input string from the user and display its information
        

            Display the following information about the string:

            Add Button That Adds A New Conversion Listing with the Default String of ""

        */


                            /*
                    For Each application.conversions:
                    input Box that sets application.conversions[index] to the value of the input box

                    Sets timeout that after 2 seconds of not timing, sets the derivedState[index] to the value 
                    of the input box passed through Utf8Examination(Buffer.from(input))

                    But the timeout resets when typing occurs

                    Displays An AnalyzePanel For The derivedState[index] 
                    That Will Asynchronously Update When the asynchronous Utf8Examination is complete


                */



        return (
            <div>  


                <div> </div>
                <h1>{application.name}</h1>
                
                <p>{application.description}</p>
                <p>{application.created_at}</p>
                <p>{application.updated_at}</p>
                <p>{application.appid}</p>
                
                
                
                {application.conversions.map((conversion, index) => {
                    return (
                        <div> 
                            <input type="text" value={conversion.value} onChange={async (e) => {
                                const newApplication = {...application}
                                newApplication.conversions[index].value = e.target.value
                                setApplication(newApplication)
                                console.log("Timouet    Triggered " + index)
                                //derivedState.current[index] = await analyzeUtf8String(Buffer.from(e.target.value))
                                const newState = await analyzeUtf8String(Buffer.from(e.target.value))
                                //Only Change This Index in the derivedState
                                setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
                                setTimeout(async() => {
                                    console.log("Timouet    Triggered " + index)
                                    //derivedState.current[index] = await analyzeUtf8String(Buffer.from(e.target.value))
                                    const newState = await analyzeUtf8String(Buffer.from(e.target.value))
                                    //Only Change This Index in the derivedState
                                    setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
                                    //setStringAnalyzed(derivedState.current[index])
                                }, 2000)
                            }} />
                            {stringAnalyzed[index].map((stringAnalyzed2, code_point) => {
                                //Analyze Panel, Displaying the stringAnalyzed
                                //And A button that changes the state by incrementing the Unicode Value 
                                //This function gets iterates through the lsit of codepoints in stringAnalyzed
                                //Add Button That increments the current codepoint and displays the new stringAnalyzed
                                return (
                                    <div>
                                        <div>----------------------------------------------------------</div>
                                        <button onClick={async() => {
                                            //Increment Current Code Point and Recompute String??
                                            //const current_string = Buffer.from(application.conversions[index].value,'utf-16le')
                                            //Get actual string 
                                            const current_string = application.conversions[index].value

                                            //

                                            //Get the code_point'th unicode code point from the string


                                            const codePointToModify = application.conversions[index].value.codePointAt(code_point*2)

                                            //const codePointToModify = current_string.toString('utf-8').codePointAt(code_point)
                                            if(!codePointToModify){
                                                return 
                                            }
                                            console.log("Index" +code_point)
                                            console.group(codePointToModify)
                                            if(!codePointToModify){
                                                return 
                                            }
                                            const new_codePoint = codePointToModify + 1
                                            const new_string = current_string.toString().replace(String.fromCodePoint(codePointToModify), String.fromCodePoint(new_codePoint))
                                            //Set State with new string 
                                            const newApplication = {...application}
                                            newApplication.conversions[index].value = new_string
                                            setApplication(newApplication)

                                            //Now Set New Computed String Analyzed
                                            const newState = await analyzeUtf8String(Buffer.from(new_string))
                                            //Only Change This Index in the derivedState

                                            setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
                                        }}>Increment Code Point</button>
                                                                         <button onClick={async() => {
                                         //Increment Current Code Point and Recompute String??
                                            //const current_string = Buffer.from(application.conversions[index].value,'utf-16le')
                                            //Get actual string 
                                            const current_string = application.conversions[index].value

                                            //

                                            //Get the code_point'th unicode code point from the string


                                            const codePointToModify = application.conversions[index].value.codePointAt(code_point*2)

                                            //const codePointToModify = current_string.toString('utf-8').codePointAt(code_point)
                                            if(!codePointToModify){
                                                return 
                                            }
                                            console.log("Index" +code_point)
                                            console.group(codePointToModify)
                                            if(!codePointToModify){
                                                return 
                                            }
                                            const new_codePoint = codePointToModify - 1
                                            const new_string = current_string.toString().replace(String.fromCodePoint(codePointToModify), String.fromCodePoint(new_codePoint))
                                            //Set State with new string 
                                            const newApplication = {...application}
                                            newApplication.conversions[index].value = new_string
                                            setApplication(newApplication)

                                            //Now Set New Computed String Analyzed
                                            const newState = await analyzeUtf8String(Buffer.from(new_string))
                                            //Only Change This Index in the derivedState

                                            setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
                                        }}>Decrement Code Point</button>
                                        {AnalyzePanel(stringAnalyzed2, index)}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
                <button onClick={() => {
                    const newApplication = {...application}
                    newApplication.conversions.push({value:""})
                    setApplication(newApplication)
                    setStringAnalyzed([...stringAnalyzed, [
                        {
                            codePoint : "20",
                            numBytes : 1,
                            grapheme : 1,
                            position : 0,
                            characterString : " ",
                            characterName : "space",
                            hexRepresentation : "0x20",
                            addUps : [
                                {
                                    byte_hex : "0x20",
                                    byte_bin : "00100000",
                                    result : "32",
                                    byte_mask : "x01000000",
                                    multiplier : 1,
                                    value : 32,
                                    accumulation_hex : "20",
                                    accumulation_dec : "32",
                                }
                            ]
                        }
                    ]])
                }}>Add</button>

            </div>
        )
        
    }

    //Display Application Display + Save Button Styled With Tailwind CSS
    return (
        <div>
            <ApplicationDisplay />
            <button onClick={saveApplication}>Save</button>
        </div>
    )

}


export default Application
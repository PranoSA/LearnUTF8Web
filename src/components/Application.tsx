/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { MouseEvent, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { analyzeUtf8String, Utf8Examination } from './utf8'
import {Buffer} from 'buffer';
import {analyzeUtf16String, Utf16Examination} from './utf16'
import { Utf32Examination, analyzeUtf32String } from './utf32';



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
    const [searchParams] = useSearchParams();
    const scrollRef = useRef<HTMLElement | null>(null);
    const [minimization, setMinimizations] = useState<boolean[]>([]);

    //const [authenticatedUser, isAuthenticatedUser] = useState<boolean>(isAuthenticatedUser());

    const [showModal, setShowModal] = useState<boolean>(false)
    const [showModalSaved, setShowModalSaved] = useState<boolean>(false)

    const [username, setUsername] = useState<string|null>(localStorage.getItem('username'))

    const [ready, setReady] = useState<boolean>(false)


    const lastElementRef = useRef<HTMLElement|null>(null);

    const [utfVersion, utfVersionSet] = useState<string>("utf-8")

    const [stringAnalyzed16, setStringAnalyzed16] = useState<Utf16Examination [][]>([])

    const [stringAnalyzed32, setStringAnalyzed32] = useState<Utf32Examination [][]>([])


    const swapUtfVersion = (s:string) => {

        utfVersionSet(s)
    }

    /*
    Add Functionality to be able to share the entire application state in a query string
    Also Modify the query string in the URL when the application state changes
    */

    //Use Query Parameters

    //Use Query Parameters to Save the Application State

    //Use Query Parameters to Load the Application State

    
    //On Load, Load the Application State from the Query Parameters
    useEffect(() => {
        if(!application) return 
        //searchParams.set("appid", applicationId || "")
        //Set searchParams for all application properties
        searchParams.set("name", application?.name || "")
        searchParams.set("created_at", application?.created_at || "")
        searchParams.set("updated_at", application?.updated_at || "")
        searchParams.set("description", application?.description || "")
        searchParams.set("conversions",(JSON.stringify(application?.conversions))|| "")

        searchParams.set("utfVersion", utfVersion)

        window.history.pushState({}, '', '?' + searchParams.toString());

       /* if (scrollRef.current) {
            scrollRef.current.focus();
        }*/
    }, [application, utfVersion])

    const fetchApplication = async () => {
        //console.log(application?.appid)
        //if(application?.appid === undefined) return
        
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/application/${applicationId}`)
        if(!response.ok){
            console.log("Faild TO Fetch")
            throw new Error("No Data")
            
        }
        const data = await response.json()
        setApplication(data)



        const promises = data.conversions.map(async (conversion:enumeratedConversion) => {
            return analyzeUtf8String(Buffer.from(conversion.value))
        })

        const promises16 = data.conversions.map(async (conversion:enumeratedConversion) => {
            return analyzeUtf16String(Buffer.from(conversion.value, 'utf16le'))
        })


        const promises32 = data.conversions.map(async (conversion:enumeratedConversion) => {
            function toUtf32Le(str: string) {
                const codePoints = Array.from(str);
                const buffer = Buffer.alloc(codePoints.length * 4);
                for (let i = 0; i < codePoints.length; i++) {
                    buffer.writeUInt32LE(codePoints[i].codePointAt(0) || 0, i * 4);
                }
                return buffer;
            }
            return analyzeUtf32String(toUtf32Le(conversion.value))
        })
        

        let newStringAnalyzed = [] as Utf8Examination[][]
        let newStringAnalyzed16 = [] as Utf16Examination[][]
        let newStringAnalyzed32 = [] as Utf32Examination[][]

        newStringAnalyzed = await Promise.all(promises)
        newStringAnalyzed16 = await Promise.all(promises16)
        newStringAnalyzed32 = await Promise.all(promises32)

        setMinimizations(newStringAnalyzed.map((value) => true))
        setReady(true)
        setStringAnalyzed(newStringAnalyzed)
        setStringAnalyzed16(newStringAnalyzed16)
        setStringAnalyzed32(newStringAnalyzed32)
    }
    

    useEffect(() => {


        const asyncInitFunction = async () => {

            if(applicationId != null){
                try {
                    console.log("Start Fetch")
                    await fetchApplication()
                     return 
                    }
                    catch(e){
                        console.log(e)
                    }

            }

            

            
            //On Mount, Set all the Application Properties from the Query Parameters


            const newApplication = {...application}
            newApplication.appid = searchParams.get("appid") || ""
            newApplication.name = searchParams.get("name") || ""
            newApplication.created_at = searchParams.get("created_at") || ""
            newApplication.updated_at = searchParams.get("updated_at") || ""
            newApplication.description = searchParams.get("description") || ""
            
            utfVersionSet(searchParams.get("utfVersion") || "utf-8")
            let newStringAnalyzed = [] as Utf8Examination[][]
            let newStringAnalyzed16 = [] as Utf16Examination[][]
            let newStringAnalyzed32 = [] as Utf32Examination[][]

            try {
            newApplication.conversions = JSON.parse(decodeURIComponent(searchParams.get("conversions") || "[]")) 
                //On Mount, Set all the String Analyzed Properties from the Query Parameters
                if(newApplication.conversions){
                    const promises = newApplication.conversions.map(async (conversion) => {
                        return analyzeUtf8String(Buffer.from(conversion.value))
                    })
                    newStringAnalyzed = await Promise.all(promises)
                    const promises16 = newApplication.conversions.map(async (conversion) => {
                        return analyzeUtf16String(Buffer.from(conversion.value, 'utf16le'))
                    })
                    newStringAnalyzed16 = await Promise.all(promises16)
                    const promises32 = newApplication.conversions.map(async (conversion) => {
                        function toUtf32Le(str: string) {
                            const codePoints = Array.from(str);
                            const buffer = Buffer.alloc(codePoints.length * 4);
                            for (let i = 0; i < codePoints.length; i++) {
                                buffer.writeUInt32LE(codePoints[i].codePointAt(0) || 0, i * 4);
                            }
                            return buffer;
                        }
                        return analyzeUtf32String(toUtf32Le(conversion.value))
                    })
                    newStringAnalyzed32 = await Promise.all(promises32)
                }
            }
            catch(e){
                console.log(e)
            }
            newApplication.conversions = newApplication.conversions || []
            setApplication(newApplication as ApplicationType)
            setStringAnalyzed(newStringAnalyzed)
            setStringAnalyzed16(newStringAnalyzed16)
            setStringAnalyzed32(newStringAnalyzed32)
            setMinimizations([...minimization, true])
            setReady(true)
        }

            asyncInitFunction()
        }

    
    ,[])

    
    useEffect(() => {
        /*if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            scrollRef.current = null;
        }*/
        /*if (scrollRef.current) {

            scrollRef.current.focus();
        }*/
    }, [stringAnalyzed, application]);

    if(!application){
        return <div> </div>
    }
    
    if(!ready){
        return <div> </div>
    }

    // Save Application by Postings To Saved Endpoint
    const saveApplication = async () => {
        //Fetch Application From https://${process.env.REACT_APP_API_URL}/applications/${applicationId}
        //Post Application to https://${process.env.REACT_APP_API_URL}/saved/${applicationId}

        if(!username){
            setShowModal(true)
            return
        }

        document.cookie = `user=${username};Path=/`;
        
        if(application == null) return 
        console.log(application)
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/application`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(application)
        })
         await response.json()
    }


    function CheckValidCodePoint(codepoint:number){
        // Invalid Ranges -> SUrrogate Pairs

        //0xD800 - 0xDFFF

        // More Than 2^20+2^16 -1 

        if(codepoint >= 0xD800 && codepoint <= 0xDFFF){
            return false
        }

        if(codepoint > 0x10FFFF){
            return false
        }
        
        return true;

    }

    //Add A Prop That is a function that can be called to modify the the conversion value
    //For that conversion, then call the function with the new value
    //from the increment and decrement functionality
    const AnalyzePanel =  (analyzedString:Utf8Examination, index:number) => {

        if(minimization[index]){
            return <div></div>
        }
    
            
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


        const changeByte =  async ( e:React.MouseEvent<HTMLButtonElement>,  index:number,pos:number, increment:boolean) => {
                                
            const newApplication = {...application}
            //How To Decrement The Value
            const currentBytes = Buffer.from(newApplication.conversions[index].value)

            //Get Codepoint at Position
            

            currentBytes[pos+analyzedString.position] = increment ? currentBytes[pos+analyzedString.position] + 1 : currentBytes[pos+analyzedString.position] - 1
            //Get the String 
            const new_string = currentBytes.toString('utf-8')
            const number_check:number = new_string.codePointAt(pos+analyzedString.position) || 0;

            console.log(new_string);
            console.log(number_check.toString(16));

            if(!CheckValidCodePoint(number_check)){
                alert("Invalid Code Point")
                return 
            }

            newApplication.conversions[index].value = new_string
            setApplication(newApplication)
            const newState = await analyzeUtf8String(currentBytes)
            //Only Change This Index in the derivedState
            setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])

            lastElementRef.current = e.target as HTMLElement;
        }

        return (
            <div className='flex flex-wrap w-full ' key={analyzedString.characterString}>
                <div className='w-full'>Grapheme # : {analyzedString.grapheme}</div>
                <div className='w-full'>
                    Code point at Position {analyzedString.position} : U+{analyzedString.codePoint}
                </div>
                    <div className="w-full">
                    <div className='w-1/2'> Number of Bytes : {analyzedString.numBytes}</div>

                    <div className='w-1/2'>textRepresentation : {analyzedString.characterString}</div>
                    <div className='w-1/2'>Name: {analyzedString.characterName}</div>
                    <div className='w-1/2'>Raw Hex Representation: 0x{analyzedString.hexRepresentation}</div>
                </div>
                <div className='py-5 w-full'></div>

                <div className="flex w-full border border-blue-600 flex-wrap" >
                    {analyzedString.addUps.map((addup, pos) => {
                    return (
                        <div className='flex flex-wrap w-full md:w-1/2 lg:w-1/4 border border-green-500 pb-5 justify-right' key={addup.accumulation_hex}>
                            <div className='w-full'> Byte # {pos+1} </div>
                            <div className = 'w-full'> Hex Representation : 0x{addup.byte_hex} </div>
                            <div className='w-full'> Binary Representation : 0b{addup.byte_bin} </div>
                            <div className='w-full'> Encoding Bits : {addup.byte_mask} </div>
                            <div className='w-full'> Decimal Byte Value : {addup.result} </div>
                            <div className='w-full'> Value : {addup.value} </div>
                            <div className='w-full'> Multiplier : 2^{Math.log2(addup.multiplier)} ({addup.multiplier}) </div>
                            <div className='w-full'> Calculated Value : (Value*Multiplier) </div>
                            <div className='w-full'> Dec : {addup.multiplier*addup.value} </div>
                            <div className="w-full"> Hex : 0x{(addup.multiplier*addup.value).toString(16)}</div>
                            <div className='w-full'> Accumulation Value : </div>
                            <div className='w-full'> Dec - {(addup.accumulation_dec)}</div>
                            <div className = "w-full"> Hex - 0x{(addup.accumulation_hex)}</div>
                            <div className="w-full flex justify-around">
                            <button className='bg-blue-500 p-2 text-white px-4 py-4 text-sm ' onClick={(e) => changeByte(e, index, pos, true)}>Increment Byte</button>
                            <button className='bg-red-500 p-2 text-white px-4 py-4 text-sm' onClick={(e) => changeByte( e,index, pos, false)}>Decrement Byte</button>
                            </div>
                        </div>
                    )
                })}
                <div className="w-full">
                    {
                        (analyzedString.addUps.map((addup,i) => {
                            const length_from_end = analyzedString.addUps.length - i - 1
                            return `0x${addup.value.toString(16)} * 0x${Math.pow(2,length_from_end*6).toString(16)} ${i==analyzedString.addUps.length-1 ? "=" : "+"}  `
                        }) + ` 0x${analyzedString.codePoint}`).split(",").join("")
                    }
                </div>
                <div className="w-full">
                    {
                        (analyzedString.addUps.map((addup,i) => {
                            const length_from_end = analyzedString.addUps.length - i - 1
                            return `${addup.value.toString(10)} * ${Math.pow(2,length_from_end*6).toString(10)} ${i==analyzedString.addUps.length-1 ? "=" : "+"}  `
                        }) + ` ${parseInt(analyzedString.codePoint, 16).toString(10)}`).split(",").join("")
                    }
                </div>
                </div>
            </div>
        )
    }

        //Add A Prop That is a function that can be called to modify the the conversion value
    //For that conversion, then call the function with the new value
    //from the increment and decrement functionality
    const AnalyzePanelUTF16 =  (analyzedString:Utf16Examination, index:number) => {

        if(minimization[index]){
            return <div></div>
        }
            
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
        

        const changeByte =  async ( e:React.MouseEvent<HTMLButtonElement>,  index:number,pos:number, increment:boolean) => {
                                

            lastElementRef.current = e.target as HTMLElement;
        }

        return (
            <div className='flex flex-wrap w-full ' key={analyzedString.characterString}>
                <div className='w-full'>Grapheme # : {analyzedString.grapheme}</div>
                <div className='w-full'>
                    Code point at Position {analyzedString.position} : U+{analyzedString.codePoint}
                </div>
                    <div className="w-full">
                    <div className='w-1/2'> Number of Bytes : {analyzedString.numBytes}</div>

                    <div className='w-1/2'>textRepresentation : {analyzedString.characterString}</div>
                    <div className='w-1/2'>Name: {analyzedString.characterName}</div>
                    <div className='w-1/2'>Raw Hex Representation: 0x{analyzedString.hexRepresentation}</div>
                </div>
                <div className='py-5 w-full'></div>

                <div className="flex w-full border border-blue-600 flex-wrap" >
                {analyzedString.addUps.map((addup, pos) => {
                    return (
                    <div className='flex flex-wrap w-full md:w-1/2 lg:w-1/4 border border-green-500 pb-5 justify-right' key={addup.accumulation_hex}>
                        <div className='w-full'> Code Point # {pos+1} </div>
                        <div className = 'w-full'> Hex Representation : 0x{addup.two_byte_hex} </div>
                        <div className='w-full'> Binary Representation : 0b{addup.two_byte_bin} </div>
                        <div className='w-full'> Encoding Bits : {addup.surrogate_mask} </div>
                        <div className='w-full'> Hexadecimal Value : {addup.value.toString(16)} </div>
                        <div className='w-full'> Decimal Value : {addup.value} </div>
                        <div className='w-full'> Multiplier : 2^{Math.log2(addup.multiplier)} ({addup.multiplier}) </div>
                        <div className='w-full'> Calculated Value : (Value*Multiplier) </div>
                        <div className='w-full'> Dec : {addup.multiplier*addup.value} </div>
                        <div className="w-full"> Hex : 0x{(addup.multiplier*addup.value).toString(16)}</div>
                        <div className='w-full'> Accumulation Value : </div>
                        <div className='w-full'> Dec - {(addup.accumulation_dec)}</div>
                        <div className = "w-full"> Hex - 0x{(addup.accumulation_hex)}</div>
                        <div className="w-full flex justify-around">
                        </div>    
                    </div>
                    )
                })}

                </div>
            </div>
        )
    }

    const analyzeUtf32Panel = (analyzedString:Utf32Examination, index:number) => {

        if(minimization[index]){
            return <div></div>
        }

        return     (       
            <div className='flex flex-wrap w-full ' key={analyzedString.characterString}>
                <div className='w-full'>Grapheme # : {analyzedString.grapheme}</div>
                <div className='w-full'>
                    Code point at Position {analyzedString.position} : U+{analyzedString.codePoint}
                </div>
                    <div className="w-full">
                    <div className='w-1/2'> Number of Bytes : {analyzedString.numBytes}</div>

                    <div className='w-1/2'>textRepresentation : {analyzedString.characterString}</div>
                    <div className='w-1/2'>Name: {analyzedString.characterName}</div>
                    <div className='w-1/2'>Raw Hex Representation: 0x{analyzedString.hexRepresentation}</div>
                </div>
                <div className='py-5 w-full'></div>

                <div className="flex w-full border border-blue-600 flex-wrap" >
                {analyzedString.addUps.map((addup, pos) => {
                    return (
                    <div className='flex flex-wrap w-full md:w-1/2 lg:w-1/4 border border-green-500 pb-5 justify-right' key={addup.accumulation_hex}>
                        <div className='w-full'> Code Point # {pos+1} </div>
                        <div className = 'w-full'> Hex Representation : 0x{addup.two_byte_hex} </div>
                        <div className='w-full'> Binary Representation : 0b{addup.two_byte_bin} </div>
                        <div className='w-full'> Encoding Bits : {"".padStart(11,'x')+"".padStart(21,'0')} </div>
                        <div className='w-full'> Decimal Byte Value : {addup.value.toString(10)} </div>
                        <div className='w-full'> Hex Value : {addup.value.toString(16)} </div>
                        <div className='w-full'> Multiplier : 2^{Math.log2(addup.multiplier)} ({addup.multiplier}) </div>
                        <div className='w-full'> Calculated Value : (Value*Multiplier) </div>
                        <div className='w-full'> Dec : {addup.multiplier*addup.value} </div>
                        <div className="w-full"> Hex : 0x{(addup.multiplier*addup.value).toString(16)}</div>
                        <div className='w-full'> Accumulation Value : </div>
                        <div className='w-full'> Dec - {(addup.accumulation_dec)}</div>
                        <div className = "w-full"> Hex - 0x{(addup.accumulation_hex)}</div>
                        <div className="w-full flex justify-around">
                        </div>    
                    </div>
                    )
                })}

                </div>
            </div>

        );
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

        

        const handleTextInputChange = async (e:React.ChangeEvent<HTMLInputElement>, index:number) => {
                const newApplication = {...application}
                console.log(e.currentTarget)
                console.log("Change Scroll Ref")
                scrollRef.current = e.currentTarget as HTMLElement
                newApplication.conversions[index].value = e.target.value
                setApplication(newApplication)
                const newState = await analyzeUtf8String(Buffer.from(e.target.value))
                setApplication(newApplication)
                console.log("Input Change")
                if(lastElementRef.current?.tagName == "BUTTON"){
                    return;
                }
                console.log("Going Through");
                function toUtf32Le(str: string) {
                    const codePoints = Array.from(str);
                    const buffer = Buffer.alloc(codePoints.length * 4);
                    for (let i = 0; i < codePoints.length; i++) {
                        buffer.writeUInt32LE(codePoints[i].codePointAt(0) || 0, i * 4);
                    }
                    return buffer;
                }
                setStringAnalyzed32([...stringAnalyzed32.slice(0,index), await analyzeUtf32String(toUtf32Le(e.target.value)),...stringAnalyzed32.slice(index+1)])
                setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1)])  
                setStringAnalyzed16([...stringAnalyzed16.slice(0,index), await analyzeUtf16String(Buffer.from(e.target.value, 'utf16le')),...stringAnalyzed16.slice(index+1)])
                //lastElementRef.current = e.currentTarget
                console.log(stringAnalyzed16);
        }

        const changeCodepoint = async (e:React.MouseEvent, index:number, code_point:number, increment:boolean) => {
                //Increment Current Code Point and Recompute String??
                const current_string = application.conversions[index].value

                //Get the code_point'th unicode code point from the string


                const codePointToModify = application.conversions[index].value.codePointAt(code_point*2)

                //const codePointToModify = current_string.toString('utf-8').codePointAt(code_point)
                if(!codePointToModify){
                    return 
                }
                
                const new_codePoint = increment ? codePointToModify + 1 : codePointToModify - 1

                const new_string = current_string.toString().replace(String.fromCodePoint(codePointToModify), String.fromCodePoint(new_codePoint))
                //Set State with new string 
                const newApplication = {...application}
                newApplication.conversions[index].value = new_string
                setApplication(newApplication)

                //Now Set New Computed String Analyzed
                const newState = await analyzeUtf8String(Buffer.from(new_string))
                //Only Change This Index in the derivedState

                setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
                
                scrollRef.current = e.currentTarget as HTMLElement
                lastElementRef.current = e.currentTarget as HTMLElement;
                setMinimizations([...minimization, false]);
            }

            const initializeCodepoint = () => {
                const newApplication = {...application}
                newApplication.conversions.push({value:" "})
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
                setStringAnalyzed16([...stringAnalyzed16, [
                    {
                        position : 0,
                        codePoint : "20",
                        numBytes : 1,
                        grapheme : 1,
                        characterString : " ",
                        characterName : "space",
                        hexRepresentation : "0x20",
                        addUps : [
                            {
                                two_byte_hex : "0x20",
                                two_byte_bin : "00100000",
                                surrogate_mask : "0000000000000000",
                                value : 32,
                                result : "32",
                                multiplier : 1,
                                accumulation_hex : "20",
                                accumulation_dec : "32",
                                surrogate_addup : 0,
                            }
                        ]
                    }
                ]])
                setStringAnalyzed32([...stringAnalyzed32, [
                    {
                        position : 0,
                        codePoint : "20",
                        numBytes : 1,
                        grapheme : 1,
                        characterString : " ",
                        characterName : "space",
                        hexRepresentation : "0x20",
                        addUps : [
                            {
                                two_byte_hex : "0x20",
                                two_byte_bin : "00100000",
                                value : 32,
                                result : "32",
                                multiplier : 1,
                                accumulation_hex : "20",
                                accumulation_dec : "32",
                            }
                        ]
                    }
                ]])
            }

            /*
                                <h1 > Application Details: </h1>
                    <h1 className="text-2xl font-bold">{application.name}</h1>
                    <p>{application.description}</p>
                    <p>{application.created_at}</p>
                    <p>{application.updated_at}</p>
                    <p>{application.appid}</p>
                    */

            if(showModal){
                return (
                    <div className=''>
                        <h2>Please enter your username</h2>
                        <div className='w-full'>
                        <input type="text" value={username||""} className="ring-2 ring-blue-500 focus:ring-blue-700 w-full" onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                        onClick={() => {
                            localStorage.setItem('username', username||"");
                            setShowModal(false);
                            saveApplication();
                        }}>
                            Submit
                        </button>
                        </div>
                 </div>
                )
            }

            if(showModalSaved){
                return (
                    <div className=''>
                        <h2>Please enter your username</h2>
                        <div className='w-full'>
                        <input type="text" value={username||""} className="ring-2 ring-blue-500 focus:ring-blue-700 w-full" onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full" onClick={() => {
                            localStorage.setItem('username', username||"");
                            setShowModalSaved(false);
                            VisitSaved()
                            console.log(username);
                        }}>
                            View Saved
                        </button>
                   
                        </div>
                 </div>
                )
            }


        return (
            <div className="flex flex-wrap space-y-12 w-full justify-around">  
                <div className='w-full' key={"Application Information"}>
                    <h1  className='py-5'> Application Details: </h1>
                    <div className="flex flex-col space-y-4 items-center w-full">
        <label className="flex justify-start w-full">
           <div className='w-1/5'> Name </div>
            <input type="text" className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2" value={application.name} onChange={e => setApplication({...application, name:e.target.value})} />
        </label>
        <label className="flex justify-start w-full">
        <div className='w-1/5'> Description </div>
            <input type="text" className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2" value={application.description} onChange={e => setApplication({...application, description:e.target.value})}/>
        </label>
        <label className="flex justify-start w-full">
        <div className='w-1/5'>Created At </div>
            <input type="text" className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2" value={application.created_at} onChange={e => setApplication({...application, created_at:e.target.value})} />
        </label>
        <label className="flex justify-start w-full">
        <div className='w-1/5'> Updated At </div>
            <input type="text" className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2" value={application.updated_at} onChange={e => setApplication({...application, updated_at:e.target.value})}/>
        </label>
        <label className="flex justify-start w-full">
        <div className='w-1/5'> Application ID </div>
            <input type="text" className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/5 ml-2" value={application.appid} onChange={e => setApplication({...application, appid:e.target.value})} />
        </label>
    </div>
                </div>

                <div className='w-full '>
                
                
                {application.conversions.map((conversion, index) => {
                    return (
                        <div className="flex flex-wrap justify-around w-full" key={"Application" + index}> 
                            <div className='w-full flex justify-center p-20 '>
                                <label className="flex justify-center w-full">
                                    <div className='w-1/7 pr-10'> String {index +1} :</div>
                                <input className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/2" type="text" onClick = {(e) => lastElementRef.current = e.currentTarget } value={conversion.value} onChange={(e) => handleTextInputChange(e,index)} />
                                </label>
                                {   minimization[index] === false ?
                                    <div className="flex flex-wrap w-1/6 justify-center">
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded w-full" onClick={() => setMinimizations([...minimization.slice(0,index), !minimization[index],...minimization.slice(index+1)])}>Hide Unicode</button>
                                    </div>:
                                    <div className="flex flex-wrap w-1/6 justify-center">
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded w-full" onClick={() => setMinimizations([...minimization.slice(0,index), !minimization[index],...minimization.slice(index+1)])}>Inspect Unicode</button>
                                    </div>
                                }
                
                            </div>
                            {utfVersion === 'utf-8' && stringAnalyzed[index].map((stringAnalyzed2, code_point) => {
                                //Analyze Panel, Displaying the stringAnalyzed
                                //And A button that changes the state by incrementing the Unicode Value 
                                //This function gets iterates through the lsit of codepoints in stringAnalyzed
                                //Add Button That increments the current codepoint and displays the new stringAnalyzed
                                

                                return (
            
                                    <div className="flex flex-wrap items-center justify-around space-y-12 "key={stringAnalyzed2.characterString}>
                                               {minimization[index] === false ?<div className='flex flex-wrap items-center justify-around space-y-12'>
                                                    <div className="flex border-t border-gray-200 my-2 w-full">----------------------------------------------------------</div>
                                                        <div className='w-1/2'>
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index, code_point, true)}>Increment Code Point</button>
                                                        </div>
                                                        <div className='w-1/2'>
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index,code_point, false)}>Decrement Code Point</button>
                                                        </div>
                                                </div>:null}
                                        {AnalyzePanel(stringAnalyzed2, index)}
                                    </div>
                                )
                            })}
                            {utfVersion == 'utf-32' && stringAnalyzed32[index].map((stringAnalyzed2, code_point) => {
                                        return (
                                            <div className="flex flex-wrap items-center justify-around space-y-12 "key={stringAnalyzed2.characterString}>
                                                
                                                {minimization[index] === false ?<div className='flex flex-wrap items-center justify-around space-y-12'>
                                                    <div className="flex border-t border-gray-200 my-2 w-full">----------------------------------------------------------</div>
                                                        <div className='w-1/2'>
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index, code_point, true)}>Increment Code Point</button>
                                                        </div>
                                                        <div className='w-1/2'>
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index,code_point, false)}>Decrement Code Point</button>
                                                        </div>
                                                </div>:null}
                                                {analyzeUtf32Panel(stringAnalyzed2,index)}
                                            </div>
                                        )
                                    })}
                                                        {utfVersion == 'utf-16' && stringAnalyzed16[index].map((stringAnalyzed2, code_point) => {
                                        return (
                                            <div className="flex flex-wrap items-center justify-around space-y-12 "key={stringAnalyzed2.characterString}>
                                                 {minimization[index] === false ?<div className='flex flex-wrap items-center justify-around space-y-12'>
                                                    <div className="flex border-t border-gray-200 my-2 w-full">----------------------------------------------------------</div>
                                                        <div className='w-1/2'>
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index, code_point, true)}>Increment Code Point</button>
                                                        </div>
                                                        <div className='w-1/2'>
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index,code_point, false)}>Decrement Code Point</button>
                                                        </div>
                                                </div>:null}
                                                {AnalyzePanelUTF16(stringAnalyzed2, index)}
                                            </div>
                                        )
                                    })}
                            
                        </div>
                    )
                })}
                </div>
                <button onClick={() => initializeCodepoint()} className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
            </div>
        )
        
    }

    const IsAuthenticatedDisplay = () => {
        return (
            <div className='w-full flex justify-center'>
                <h1 className='text-2xl font-bold'>Authenticated as {document.cookie.split('user=')[1].split(';')[0] }</h1>
            </div>
        );
    }


    const CheckAuthenticated =():boolean => {
        if(document.cookie.split('user=').length < 2) return false;
        if(document.cookie.split('user=')[1] == "") return false;

        return true
    }

    

    const VisitSaved= () => {
        if(username == null || username == ""){
            setShowModalSaved(true)
            return 
        }
        document.cookie = `user=${username};Path=/`;
        window.location.href = "/saved"

    }


    //Display Application Display + Save Button Styled With Tailwind CSS
    return (
        <div className='flex flex-wrap justify-center'>
            {CheckAuthenticated()? IsAuthenticatedDisplay(): <div></div>}
            <div className='w-full flex justify-center'> 

                    <button className="bg-red-400 text-white px-4 py-2 rounded" onClick={() => VisitSaved()}>View Saved</button>
                
            </div> 
            <div className='flex pt-10 pb-45 w-full justify-center'>
                <button className="bg-blue-400 text-white px-4 py-2 rounded" onClick={() => saveApplication()}>Save</button>
            </div>
            <div className='w-full flex justify-around py-10'>
            <button 
                    className={`text-white px-4 py-2 rounded w-1/6 ${utfVersion === "utf-8" ? "bg-blue-600" : "bg-blue-200"}`} 
                    onClick={() => swapUtfVersion("utf-8")}
                >
                    UTF-8
                </button>
                <button 
                    className={`text-white px-4 py-2 rounded w-1/6 ${utfVersion === "utf-16" ? "bg-blue-600" : "bg-blue-200"}`} 
                    onClick={() => swapUtfVersion("utf-16")}
                >
                    UTF-16
                </button>
                <button 
                    className={`text-white px-4 py-2 rounded w-1/6 ${utfVersion === "utf-32" ? "bg-blue-600" : "bg-blue-200"}`} 
                    onClick={() => swapUtfVersion("utf-32")}
                >
                    UTF-32
                </button>
            </div>
            <div className='flex w-full justify-center pl-4 '>
                {ApplicationDisplay()}
            </div>
        </div>
    )

}


export default Application
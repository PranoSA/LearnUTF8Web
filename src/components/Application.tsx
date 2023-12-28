/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { analyzeUtf8String, Utf8Examination } from './utf8'
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
    const [searchParams] = useSearchParams();
    const scrollRef = useRef<HTMLElement | null>(null);

    const [showModal, setShowModal] = useState<boolean>(false)
    const [username, setUsername] = useState<string|null>(localStorage.getItem('username'))

    /*
    Add Functionality to be able to share the entire application state in a query string
    Also Modify the query string in the URL when the application state changes
    */

    //Use Query Parameters

    //Use Query Parameters to Save the Application State

    //Use Query Parameters to Load the Application State

    
    //On Load, Load the Application State from the Query Parameters
    useEffect(() => {
        console.log("In The Set")
        console.log(application)
        if(!application) return 
        //searchParams.set("appid", applicationId || "")
        //Set searchParams for all application properties
        searchParams.set("name", application?.name || "")
        searchParams.set("created_at", application?.created_at || "")
        searchParams.set("updated_at", application?.updated_at || "")
        searchParams.set("description", application?.description || "")
        searchParams.set("conversions",(JSON.stringify(application?.conversions))|| "")
         console.log(searchParams.get('conversions'))
         console.log(JSON.parse(decodeURIComponent(searchParams.get('conversions') || "[]")))
        window.history.pushState({}, '', '?' + searchParams.toString());
        console.log(application);
        console.log(stringAnalyzed)
        if (scrollRef.current) {
            console.log("Scroll Ref")
            console.log(scrollRef.current)
            scrollRef.current.focus();
        }
    }, [application])

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

        let newStringAnalyzed = [] as Utf8Examination[][]

        newStringAnalyzed = await Promise.all(promises)
        console.log("String Analyzed")
        console.log(newStringAnalyzed)
        setStringAnalyzed(newStringAnalyzed)
    }
    

    useEffect(() => {


        const asyncInitFunction = async () => {
            console.log("In The Init")
            console.log(searchParams.get('name'))

            console.log(applicationId)



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
            let newStringAnalyzed = [] as Utf8Examination[][]

            try {
            newApplication.conversions = JSON.parse(decodeURIComponent(searchParams.get("conversions") || "[]")) 
                //On Mount, Set all the String Analyzed Properties from the Query Parameters
                if(newApplication.conversions){
                    const promises = newApplication.conversions.map(async (conversion) => {
                        return analyzeUtf8String(Buffer.from(conversion.value))
                    })
                    newStringAnalyzed = await Promise.all(promises)
                    console.log("String Analyzed")
                    console.log(newStringAnalyzed)
                }
            }
            catch(e){
                console.log(e)
            }
            newApplication.conversions = newApplication.conversions || []
            console.log("Loaded Application")
            setApplication(newApplication as ApplicationType)
            console.log(setStringAnalyzed)
            setStringAnalyzed(newStringAnalyzed)
            
            console.log(newApplication.conversions)
            console.log(searchParams.get("conversions"))
        }

            asyncInitFunction()
        }

    
    ,[])

    

    useEffect(() => {
        const fetchApplication = async () => {
            if(application?.appid === undefined) return
            
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/application/${application.appid}`)
            const data = await response.json()
            setApplication(data)
        }
        if(applicationId){
                try {
                fetchApplication()
                }
                catch(e){
                    console.log(e)
                }
        }
    }, [applicationId])

    useEffect(() => {
        /*if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
            scrollRef.current = null;
        }*/
        if (scrollRef.current) {
            console.log("Scroll Ref")
            console.log(scrollRef.current)
            scrollRef.current.focus();
        }
    }, [stringAnalyzed, application]);

    if(!application){
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

        document.cookie = `user=${username}`;
        
        if(application == null) return 
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/application`, {
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


        const changeByte =  async ( index:number,pos:number, increment:boolean) => {
                                
            const newApplication = {...application}
            //How To Decrement The Value
            const currentBytes = Buffer.from(newApplication.conversions[index].value)
            currentBytes[pos+analyzedString.position] = increment ? currentBytes[pos+analyzedString.position] + 1 : currentBytes[pos+analyzedString.position] - 1
            //Get the String 
            const new_string = currentBytes.toString('utf-8')
            newApplication.conversions[index].value = new_string
            setApplication(newApplication)
            const newState = await analyzeUtf8String(currentBytes)
            //Only Change This Index in the derivedState
            setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1) ])
        }

        return (
            <div className='flex flex-wrap md:w-full border border-red-500 ' key={analyzedString.characterString}>
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
                <div className='py-5 w-full t-5'></div>

                <div className="flex w-full border border-blue-600" >
                    {analyzedString.addUps.map((addup, pos) => {
                    return (
                        <div className='flex flex-wrap w-full md:w-1/2 border border-green-500 justify-right p-4' key={addup.accumulation_hex}>
                            <div className='w-full'> Byte # {pos} </div>
                            <div className = 'w-full'> Hex Representation : 0x{addup.byte_hex} </div>
                            <div className='w-full'> Binary Representation : 0b{addup.byte_bin} </div>
                            <div className='w-full'> Decimal Byte Value : {addup.result} </div>
                            <div className='w-full'> Encoding Bits : {addup.byte_mask} </div>
                            <div className='w-full'> Value : {addup.value} </div>
                            <div className='w-full'> Multiplier : 2^{Math.log2(addup.multiplier)} ({addup.multiplier}) </div>
                            <div className='w-full'> Calculated Value : (Value*Multiplier) </div>
                            <div className='w-full'> Dec : {addup.multiplier*addup.value} </div>
                            <div className="w-full"> Hex : 0x{(addup.multiplier*addup.value).toString(16)}</div>
                            <div className='w-full'> Accumulation Value : </div>
                            <div className='w-full'> Dec - {(addup.accumulation_dec)}</div>
                            <div className = "w-full"> Hex - 0x{(addup.accumulation_hex)}</div>
                            <div className="w-full flex justify-around">
                            <button className='bg-blue-500 p-5 text-white px-4 ' onClick={() => changeByte( index, pos, true)}>Increment Byte</button>
                            <button className='bg-red-500 p-5 text-white px-4' onClick={() => changeByte( index, pos, false)}>Decrement Byte</button>
                            </div>
                        </div>
                    )
                })}
                </div>
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

        const handleTextInputChange = async (e:React.ChangeEvent<HTMLInputElement>, index:number) => {
                const newApplication = {...application}
                console.log(e.currentTarget)
                console.log("Change Scroll Ref")
                scrollRef.current = e.currentTarget as HTMLElement
                newApplication.conversions[index].value = e.target.value
                setApplication(newApplication)
                const newState = await analyzeUtf8String(Buffer.from(e.target.value))
                setApplication(newApplication)
                setStringAnalyzed([...stringAnalyzed.slice(0,index), newState,...stringAnalyzed.slice(index+1)])  
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
                    <div>
                        <h2>Please enter your username</h2>
                        <input type="text" value={username||""} onChange={e => setUsername(e.target.value)} />
                        <button onClick={() => {
                            localStorage.setItem('username', username||"");
                            setShowModal(false);
                            saveApplication();
                        }}>
                            Submit
                        </button>
                 </div>
                )
            }


        return (
            <div className="flex flex-wrap space-y-12 w-full justify-around">  
                <div className='w-full'>
                    <h1 > Application Details: </h1>

                    <input type="text"  value={application.name} onChange={e => setApplication({...application, name:e.target.value})} />
                    <input type="text" value={application.description} onChange={e => setApplication({...application, description:e.target.value})}/>
                    <input type="text" value={application.created_at} onChange={e => setApplication({...application, created_at:e.target.value})} />
                    <input type="text" value={application.updated_at} onChange={e => setApplication({...application, updated_at:e.target.value})}/>
                    <input type="text" value={application.appid} onChange={e => setApplication({...application, appid:e.target.value})} />

                </div>

                <div className='w-full'> -------------------------------------------------------------------------------------------------------------------------------</div>

                <div className='w-full '>
                
                
                {application.conversions.map((conversion, index) => {
                    return (
                        <div className="flex flex-wrap justify-around w-full"> 
                            <div className='w-full flex justify-center p-20 '>
                                <input className="ring-2 ring-blue-500 focus:ring-blue-700 w-1/4" type="text" value={conversion.value} onChange={(e) => handleTextInputChange(e,index)} />
                            </div>
                            {stringAnalyzed[index].map((stringAnalyzed2, code_point) => {
                                //Analyze Panel, Displaying the stringAnalyzed
                                //And A button that changes the state by incrementing the Unicode Value 
                                //This function gets iterates through the lsit of codepoints in stringAnalyzed
                                //Add Button That increments the current codepoint and displays the new stringAnalyzed
                                return (
                                    <div className="flex flex-wrap items-center justify-around space-y-12 "key={stringAnalyzed2.characterString}>
                                        <div className="flex border-t border-gray-200 my-2 w-full">----------------------------------------------------------</div>
                                        <div className='w-1/2'>
                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index, code_point, true)}>Increment Code Point</button>
                                        </div>
                                        <div className='w-1/2'>
                                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={(e) => changeCodepoint(e,index,code_point, false)}>Decrement Code Point</button>
                                        </div>
                                        {AnalyzePanel(stringAnalyzed2, index)}
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

    

    //Display Application Display + Save Button Styled With Tailwind CSS
    return (
        <div className='flex flex-wrap justify-center'>
            <div className='w-full p-20'> 
                <Link to="/saved">
                    <button>View Saved</button>
                </Link>
            </div> 
            <div className='flex pt-20 pb-45 w-full justify-center'>
                <button className="bg-blue-400 text-white px-4 py-2 rounded" onClick={() => saveApplication()}>Save</button>
            </div>
            <div className='flex w-full pl-60 '>
                <ApplicationDisplay />
            </div>
        </div>
    )

    /*return (
<div className="flex  flex-wrap justify-evenly">
  <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 p-4 ">
    STAY AWAY
  </div>
  <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 p-4">
      STAY AWAY
  </div>
  <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 p-4">
      STAY AWAY
  </div>
  <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 p-4">s
      STAY AWAY
  </div>
</div>
    )*/
    

}


export default Application
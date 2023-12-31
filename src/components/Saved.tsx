

/**
 * 
 * 
 * 
 * 
 */

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type SavedApplication = {
    appid : string
    name : string 
    created_at : string 
    updated_at : string
    description : string
}

//Saved Component
const Saved = () => {

    const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([])

    const [username, setUsername]= useState<string | null>(localStorage.getItem('user'));

    const [showModal, setShowModal] = useState<boolean>(false)

    

    useEffect(() => {

        if(username != null){
            setShowModal(false)
        }

        if(showModal){
            return
        }

        const fetchSavedApplications = async () => {
            if(username === null){
                setUsername('ssd123')
            }
            /*
            document.cookie = `user=ssd123; domain=unicode.compressibleflowcalculator.com; path=/Prod/api/v1/; SameSite=None; Secure`;
            console.log("cookie set")
            document.cookie = 'poop=pee; path="/saved;'
            console.log(document.cookie)
            */
            try {
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/saved`, {
                    credentials: 'include',
                    method: "GET",
                })
                const data = await response.json()
                setSavedApplications(data)
            }
            catch (error) {
                setSavedApplications([])
            }
        }

        fetchSavedApplications()
    }, [showModal])

    if(showModal){
        return (
            <div className="flex flex-wrap">
                <h2>Please enter your username</h2>
                <input type="text" value={username||""} onChange={e => setUsername(e.target.value)} />
                <button onClick={() => {
                    localStorage.setItem('username', username||"");
                    setShowModal(false);
                }}>
                    Submit
                </button>
         </div>
        )
    }

    return (
        <div className="flex flex-wrap">  
            <h1>Saved Applications</h1>
            <ul>
                {savedApplications.map((savedApplication) => (
                    <div className="flex justify-center p-10 " >
                        <li key={savedApplication.appid}>
                            <Link to={`/home/${savedApplication.appid}`}>
                                {savedApplication.name}
                            </Link>
                        </li>
                    </div>
                ))}
            </ul>
        </div>
    )
}

export default Saved
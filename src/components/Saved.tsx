

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

    useEffect(() => {
        const fetchSavedApplications = async () => {
            const response = await fetch('http://localhost:8080/saved')
            const data = await response.json()
            setSavedApplications(data)
        }
        fetchSavedApplications()
    }, [])

    return (
        <div>
            <h1>Saved Applications</h1>
            <ul>
                {savedApplications.map((savedApplication) => (
                    <li key={savedApplication.appid}>
                        <Link to={`/home/${savedApplication.appid}`}>
                            {savedApplication.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Saved
import { createContext, useState ,useEffect} from "react";
import { toast } from 'react-toastify'
import axios from 'axios'
import { data } from "react-router-dom";


export const AppContent = createContext()

export const AppContextProvider = (props) => {
 
  const backendUrl="https://mern-auth-hvn9.onrender.com";
    axios.defaults.withCredentials = true; 

    
    const [isloggedin, setIsloggedin] = useState(false);
    const [userData, setUserData] = useState(null)

    const getAuthState = async ()=>{
        try{
           const {data} =  await axios.get(backendUrl + '/api/auth/is-auth')
           if(data.success)
           {
            setIsloggedin(true)
            getUserdata()
           }
        }
        catch(error){
            toast.error(error.message)
        }
    }


    const getUserdata = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data');
            
            if (data.success) {
      setUserData(data.userData);
     
    } else {
      toast.error(data.message);
    }
        }
        catch (error) {
             toast.error(error.message)
        }
    }
  
    useEffect(()=>{
  getAuthState()
    },[])

    const value = {
        backendUrl,
        isloggedin, setIsloggedin,
        userData, setUserData,
        getUserdata
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}

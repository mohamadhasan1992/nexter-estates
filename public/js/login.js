import {showAlerts} from './alerts';
import axios from 'axios';
export const login = async (email,password) => {
    try{
        const result = await axios({
          method: 'POST',
          url: 'http://127.0.0.1:3000/api/v1/users/login',
          data:{
              email,
              password
          }
        });
        
        if (result.data.status === 'success') {
          showAlerts('success', 'با موفقیت وارد شدید');
          window.setTimeout(()=>{
              location.assign('/');
          },100);
        }
        
    }catch(error){
        showAlerts('error', error.response.data.message);
    }
}

export const logOut = async () => {
    try{
        const result = await axios({
          method: 'GET',
          url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });
        if(result.data.status === 'success'){
            location.assign('/');
            // location.reload(true);
        }

    }catch(error){
        
        showAlerts('error','مشکلی در خروج اتفاق افتاده است.');
    }
}

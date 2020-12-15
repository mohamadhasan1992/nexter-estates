import axios from 'axios';
import {showAlerts} from './alerts';

//data refers to an object
//type refers to password or email
export const updateSettings = async (data, type) => {
  console.log(data);
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatemypassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateme';
    const result = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (result.data.status === 'success') {
        if(type === 'password'){
            showAlerts('success', ' رمز عبور به روز رسانی شد');
        }else{
            showAlerts('success', 'حساب کاربری به روز رسانی شد');
        }
      
      window.setTimeout(() => {
        location.assign('/');
      }, 100);
    }
  } catch (error) {
    showAlerts('error', error.response.data.message);
  }
};

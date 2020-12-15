import '@babel/polyfill';
import { login, logOut } from './login.js';
import { updateSettings } from './updateSettings.js';

//DOM ELEMENT
const logInForm = document.querySelector('.form--login');
const updateForm = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');

//DELEGATION
//updating user photo
//updating password
if (updatePassword) {
    updatePassword.addEventListener('submit', (e) => {
    document.getElementById('btn-password').textContent = 'به روز رسانی ....';
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
  });
}
//updating user information
if(updateForm){
    updateForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('username', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        
        updateSettings(form,'data');
    })
}
//loging in a user
if(logInForm){
    logInForm.addEventListener('submit' , e => {
        e.preventDefault();
        //DOM VALUES
        const form = new FormData();
        // form.append('email', document.getElementById('email').value);
        // form.append('password', document.getElementById('password').value);
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);
    })
}

const logout = document.querySelector('.btn--logout');
if(logout){
    logout.addEventListener('click', logOut);
}

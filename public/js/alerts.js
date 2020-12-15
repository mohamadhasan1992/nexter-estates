const hideAlerts = ()=>{
    const el = document.querySelector('.alert');
    if(el){
        el.parentNode.removeChild(el);
    }

}

//type should get success or error 
export const showAlerts = (type, msg) => {
  hideAlerts();
  const markup = `<div dir="rtl" class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlerts, 5000);
};
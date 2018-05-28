const initform = event => {
  const input = document.querySelector('#habroname');
  input.value = localStorage['options.html#habroname'] || '';
  const saveform = event => {
    localStorage['options.html#habroname'] = input.value || '';
  };
  input.addEventListener('change', saveform);
  document.addEventListener('unload', saveform);
};
document.addEventListener('DOMContentLoaded', initform);

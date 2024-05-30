/** Extract the root URL (protocol + hostname + port) **/
const rootUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

/** SERVER-SIDE URL **/
// const serverUrl = 'http://45.136.71.186:3001'; //ExamPrepTutor Server URL
// const serverUrl = 'https://server.exampreptutor.com' //ExamPrepTutor Server UR

const serverUrl = 'http://localhost:3005'; //Localhost

// const serverUrl = 'https://jz8w6z-3005.csb.app' //Derrick codesandbox
// const serverUrl = 'https://9rtmcd-3005.csb.app' //Derrick123 codesandbox
// const serverUrl = 'https://nk7rt3-3005.csb.app' //Crownzcom codesandbox
// const serverUrl = rootUrl; // Same server as the backend server-side

export { serverUrl, rootUrl };


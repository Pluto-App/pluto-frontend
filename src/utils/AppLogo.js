
const logos = require.context('../assets/logos', true);

const logos_path = './';

const appLogos = {
  'electron':     'electron.png',
  'sublimetext':  'sublimetext.png',
  'terminal':     'terminal.png',
  'chrome':       'chrome.png',
  'googlechrome': 'chrome.png',
  'trello':       'trello.png'
}
  
export const appLogo = function(appName) {

  var logo = "https://ui-avatars.com/api/?background=black&name=";

  if(appLogos[appName]) {

    logo = logos(logos_path + appLogos[appName]);
  }

  return logo;  
}
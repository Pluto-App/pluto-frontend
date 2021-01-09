
const logos = require.context('../assets/logos', true);

const logos_path = './';

const appLogos = {
  'chrome':         'chrome.png',
  'discord':        'discord.png',
  'electron':       'electron.png',
  'github':         'github.png',
  'googledrive':    'googledrive.png',
  'googledocs':     'googledocs.png',
  'googlesheets':   'googlesheets.png',
  'googlechrome':   'chrome.png',
  'sublime_text':   'sublimetext.png',
  'sublimetext':    'sublimetext.png',
  'stackoverflow':  'stackoverflow.png',
  'slack':          'slack.png',
  'terminal':       'terminal.png',
  'trello':         'trello.png'
}

const hostApp = {
  'drive.google.com':   'googledrive',
  'docs.google.com':    'googledocs|googlesheets',
  'discord.com':        'discord',
  'github.com':         'github',
  'slack.com':          'slack',
  'app.slack.com':      'slack',
  'stackoverflow.com':  'stackoverflow',
  'trello.com':         'trello'
}
  
export const appLogo = function(appName, url) {

  var logo = "https://ui-avatars.com/api/?background=black&name=";

  if(url) {
    url = new URL(url);

    appName = hostApp[url.hostname] ? hostApp[url.hostname] : appName;

    // Google Document or Google Sheet?
    if(appName == 'googledocs|googlesheets') {

      var doc_type = url.pathname.split('/')[1]; 

      switch(doc_type) {
        case 'document':
          appName = 'googledocs';
          break;
        case 'spreadsheets':
          appName = 'googlesheets';
          break;
        default:
          // do nothing
      }

    }
  }

  if(appLogos[appName]) {

    logo = logos(logos_path + appLogos[appName]);
  }

  return logo;  
}
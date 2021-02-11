
const logos = require.context('../assets/logos', true);

const logos_path = './';

const appLogos = {
  'discord':        { name: 'Discord', logo: logos(logos_path + 'discord.png') },
  'electron':       { name: 'Electron', logo: logos(logos_path + 'electron.png') },
  'figma':          { name: 'Figma', logo: logos(logos_path + 'figma.png')  },
  'github':         { name: 'GitHub', logo: logos(logos_path + 'github.png') } ,
  'googledrive':    { name: 'Google Drive', logo: logos(logos_path + 'googledrive.png') } ,
  'googledocs':     { name: 'Google Docs', logo: logos(logos_path + 'googledocs.png') } ,
  'googlesheets':   { name: 'Google Sheets', logo: logos(logos_path + 'googlesheets.png') } ,
  'sublimetext':    { name: 'Sublime Text', logo: logos(logos_path + 'sublimetext.png') } ,
  'stackoverflow':  { name: 'Stack Overflow', logo: logos(logos_path + 'stackoverflow.png') } ,
  'slack':          { name: 'Slack', logo: logos(logos_path + 'slack.png') } ,
  'terminal':       { name: 'Terminal', logo: logos(logos_path + 'terminal.png') } ,
  'trello':         { name: 'Trello', logo: logos(logos_path + 'trello.png') } 
}

const hostApp = {
  'drive.google.com':   'googledrive',
  'docs.google.com':    'googledocs|googlesheets',
  'discord.com':        'discord',
  'www.figma.com':      'figma',
  'github.com':         'github',
  'slack.com':          'slack',
  'app.slack.com':      'slack',
  'stackoverflow.com':  'stackoverflow',
  'trello.com':         'trello'
}
  
export const appLogo = function(appData, userPreference) {

  var appInfo = {};

  if(appData && appData.owner && appData.owner.name) {

    var appName = appData.owner.name.toLowerCase().replace(/ /g,'').replace('.exe','');
    var url = appData.url;
    var logo;

    if(url) {
      url = new URL(url);
      console.log(url);
      console.log(url.hostname);
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

      logo = appLogos[appName]['logo'];
    }

    if(userPreference.show_active_app){
      appInfo['logo'] = logo;
      appInfo['name'] = appName;

      if(userPreference.share_active_app){
        appInfo['url'] = url;     
      }  
    }
  }

  return appInfo;  
}

export const supportedApps = function() {
  return appLogos;
}
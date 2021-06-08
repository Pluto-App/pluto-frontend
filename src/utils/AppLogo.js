
const logos = require.context('../assets/logos', true);

const logos_path = './';

function getLogo(appName) {
  return logos(logos_path + appName + '.png').default;
}

const appLogos = {
  'asana':                { name: 'Asana', logo: getLogo('asana') },
  'airtable':             { name: 'Airtable', logo: getLogo('airtable') },
  'basecamp':             { name: 'Basecamp', logo: getLogo('basecamp') },
  'canva':                { name: 'Canva', logo: getLogo('canva') },
  'discord':              { name: 'Discord', logo: getLogo('discord') },
  'dropbox':              { name: 'Dropbox', logo: getLogo('dropbox') },
  'electron':             { name: 'Electron', logo: getLogo('electron') },
  'excel':                { name: 'Excel', logo: getLogo('excel') },
  'figma':                { name: 'Figma', logo: getLogo('figma')  },
  'github':               { name: 'GitHub', logo: getLogo('github') },
  'gitlab':               { name: 'GitLab', logo: getLogo('gitlab') },
  'miro':                 { name: 'Miro', logo: getLogo('miro') },
  'notion':               { name: 'Notion', logo: getLogo('notion') },
  'quip':                 { name: 'Quip', logo: getLogo('quip') },
  'googledrive':          { name: 'Google Drive', logo: getLogo('googledrive') },
  'googledocs':           { name: 'Google Docs', logo: getLogo('googledocs') },
  'googlesheets':         { name: 'Google Sheets', logo: getLogo('googlesheets') },
  'googlecalendar':       { name: 'Google Calendar', logo: getLogo('googlecalendar') },
  'googlemeet':           { name: 'Google Meet', logo: getLogo('googlemeet') },
  'googlecloud':          { name: 'Google Cloud', logo: getLogo('googlecloud') },
  'microsoftword':        { name: 'Word', logo: getLogo('word') },
  'microsoftpowerpoint':  { name: 'PowerPoint', logo: getLogo('powerpoint') },
  'sublimetext':          { name: 'Sublime Text', logo: getLogo('sublimetext') },
  'stackoverflow':        { name: 'Stack Overflow', logo: getLogo('stackoverflow') },
  'slack':                { name: 'Slack', logo: getLogo('slack') },
  'skype':                { name: 'Skype', logo: getLogo('skype') },
  'taskable':             { name: 'Taskable', logo: getLogo('taskable') },
  'terminal':             { name: 'Terminal', logo: getLogo('terminal') },
  'telegram':             { name: 'Telegram', logo: getLogo('telegram') },
  'trello':               { name: 'Trello', logo: getLogo('trello') },
  'xcode':                { name: 'XCode', logo: getLogo('xcode') }, 
  'zoom.us':              { name: 'Zoom', logo: getLogo('zoom') } 
}

const hostApp = {
  'airtable.com':       'airtable',
  'asana.com':          'asana',
  'basecamp.com':       'basecamp',
  'www.canva.com':      'canva',
  'drive.google.com':   'googledrive',
  'docs.google.com':    'googledocs|googlesheets',
  'calendar.google.com':'googlecalendar',
  'meet.google.com':    'googlemeet',
  'cloud.google.com':   'googlecloud',
  'discord.com':        'discord',
  'www.dropbox.com':    'dropbox',
  'www.figma.com':      'figma',
  'github.com':         'github',
  'gitlab.com':         'gitlab',
  'miro.com':           'miro',
  'www.notion.so':      'notion',
  'quip.com':           'quip',
  'slack.com':          'slack',
  'app.slack.com':      'slack',
  'stackoverflow.com':  'stackoverflow',
  'taskablehq.com':     'taskable',
  'trello.com':         'trello',
  'zoom.us':            'zoom.us'
}

const windowsAppsMap = {
  'winword': 'microsoftword',
  'powerpnt': 'microsoftpowerpoint'
}
  
export const appLogo = function(appData, userPreference) {

  var appInfo = {};

  if(appData && appData.owner && appData.owner.name) {

    var appName = appData.owner.name.toLowerCase().replace(/ /g,'').replace('.exe','');
    var url = appData.url;
    var logo;

    if(!appLogos[appName] && windowsAppsMap[appName]){
      appName = windowsAppsMap[appName];
    }

    if(url) {
      try {
        url = new URL(url);

        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }

        appName = hostApp[url.hostname] ? hostApp[url.hostname] : appName;

        // Google Document or Google Sheet?
        if(appName === 'googledocs|googlesheets') {

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
      } catch (error) {
        console.log('Error parsing URL: ' + url);
        console.log(error);
      }
      
    }

    if(appLogos[appName]) {

      logo = appLogos[appName]['logo'];
    }

    if(!userPreference || userPreference.show_active_app){
      appInfo['logo'] = logo;

      if(appLogos[appName])
        appInfo['name'] = appLogos[appName]['name'];

      if(!userPreference || userPreference.share_active_app){
        appInfo['url'] = url;     
      }  
    }
  }

  return appInfo;  
}

export const supportedApps = function() {
  return appLogos;
}
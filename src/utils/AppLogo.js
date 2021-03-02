
const logos = require.context('../assets/logos', true);

const logos_path = './';

const appLogos = {
  'asana':          { name: 'Asana', logo: logos(logos_path + 'asana.png') },
  'airtable':       { name: 'Airtable', logo: logos(logos_path + 'airtable.png') },
  'basecamp':       { name: 'Basecamp', logo: logos(logos_path + 'basecamp.png') },
  'canva':          { name: 'Canva', logo: logos(logos_path + 'canva.png') },
  'discord':        { name: 'Discord', logo: logos(logos_path + 'discord.png') },
  'dropbox':        { name: 'Dropbox', logo: logos(logos_path + 'dropbox.png') },
  'electron':       { name: 'Electron', logo: logos(logos_path + 'electron.png') },
  'figma':          { name: 'Figma', logo: logos(logos_path + 'figma.png')  },
  'github':         { name: 'GitHub', logo: logos(logos_path + 'github.png') } ,
  'gitlab':         { name: 'GitLab', logo: logos(logos_path + 'gitlab.png') } ,
  'miro':           { name: 'Miro', logo: logos(logos_path + 'miro.png') } ,
  'notion':         { name: 'Notion', logo: logos(logos_path + 'notion.png') } ,
  'quip':           { name: 'Quip', logo: logos(logos_path + 'quip.png') } ,
  'googledrive':    { name: 'Google Drive', logo: logos(logos_path + 'googledrive.png') } ,
  'googledocs':     { name: 'Google Docs', logo: logos(logos_path + 'googledocs.png') } ,
  'googlesheets':   { name: 'Google Sheets', logo: logos(logos_path + 'googlesheets.png') } ,
  'googlecalendar': { name: 'Google Calendar', logo: logos(logos_path + 'googlecalendar.png') } ,
  'googlemeet':     { name: 'Google Meet', logo: logos(logos_path + 'googlemeet.png') } ,
  'googlecloud':    { name: 'Google Cloud', logo: logos(logos_path + 'googlecloud.png') } ,
  'sublimetext':    { name: 'Sublime Text', logo: logos(logos_path + 'sublimetext.png') } ,
  'stackoverflow':  { name: 'Stack Overflow', logo: logos(logos_path + 'stackoverflow.png') } ,
  'slack':          { name: 'Slack', logo: logos(logos_path + 'slack.png') } ,
  'taskable':       { name: 'Taskable', logo: logos(logos_path + 'taskable.png') } ,
  'terminal':       { name: 'Terminal', logo: logos(logos_path + 'terminal.png') } ,
  'trello':         { name: 'Trello', logo: logos(logos_path + 'trello.png') } ,
  'zoom':           { name: 'Zoom', logo: logos(logos_path + 'zoom.png') } 
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
  'zoom.us':            'zoom'
}
  
export const appLogo = function(appData, userPreference) {

  var appInfo = {};

  if(appData && appData.owner && appData.owner.name) {

    var appName = appData.owner.name.toLowerCase().replace(/ /g,'').replace('.exe','');
    var url = appData.url;
    var logo;

    if(url) {
      url = new URL(url);

      if (!/^https?:\/\//i.test(url)) {
          url = 'http://' + url;
      }
      
      console.log(url.hostname);

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
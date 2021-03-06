const botCommands = [];

let authorBuffer = []

const createAuthorEntry = function(message) {
  const entry = {
    author: message.author.id,
    timeOut: false
  }

  setTimeout(function(){
    entry.timeOut = true
  }, 60000)

  return entry
}

const flushAuthorEntries = function() {
  authorBuffer = authorBuffer.filter(entry => entry.timeOut == false)
}

function registerBotCommand(regex, fn) {
  botCommands.push({ regex, fn });
}

async function listenToMessages(client) {
  client.on("message", message => {
    // Prevent bot from responding to its own messages
    if (message.author === client.user) {
      return;
    }

    const NOBOT_ROLE_ID = "513916941212188698";

    // can't bot if user is NOBOT
    if (
      message.author &&
      message.author.lastMessage &&
      message.author.lastMessage.member &&
      message.author.lastMessage.member.roles &&
      message.author.lastMessage.member.roles.has(NOBOT_ROLE_ID)
    ) {
      return;
    }

    const authorEntryCount = authorBuffer.reduce((count, current) => {
      if (current.author == message.author.id) {
        return count + 1
      }
    },0)

    flushAuthorEntries()

    if (authorEntryCount > 10) {
      console.log('DENIED')
      return
    }


    botCommands.forEach(async ({ regex, fn }) => {
      if (message.content.toLowerCase().match(regex)) {
        authorBuffer.push(createAuthorEntry(message))
        try {
          const response = await fn(message);

          if (response) {
            try {
              message.channel.send(response);
            } catch (e) {
              console.log(e);
            }
          }
        }
        catch(e) {
          console.log(e)
        }
      }
    });
  });
}

module.exports = { listenToMessages, registerBotCommand };

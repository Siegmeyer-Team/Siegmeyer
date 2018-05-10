const Discord = require('discord.js');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.run = ((config, message, args) => {

  const client = message.client;
  const map_id = args.join(' ');
  
  if (!map_id) return message.channel.send('Specify an approved map to fetch.');
  
  const role_color = !message.guild.me.displayColor ? 12172222 : message.guild.me.displayColor;
  
  const encodeSpaces = (player => player.replace(/\u200b/g, '').replace(/\s/g, '%20'));

  const pb2_url = 'https://plazmaburst2.com/';
  const map_ref = encodeSpaces(pb2_url + '?s=9&m=' + map_id);
  const pb2_server = client.guilds.get('328650645793931267');
  const pb2_icon = pb2_server ? pb2_server.iconURL : 'https://cdn.discordapp.com/icons/328650645793931267/cb212d87fd062eb467540febea1f73a3.png';

  message.channel.startTyping();

  request(map_ref, function(err, res, body) {
    if (err) return console.log(err);

    if (res && res.statusCode == 200) {
      const document = new JSDOM(body).window.document;
      const map_info = new Discord.RichEmbed();

      const unapproved = document.querySelector('#content_header_block a');
      if (!unapproved) {
        return message.channel.send(`\`${map_id}\` is either unapproved or unpublished. Try another map.`).then(() => {
          message.channel.stopTyping();
        });
      }

      const container = document.querySelector('#content_header_block .bb table table tbody');
      const map_name = container.firstElementChild.querySelector('td > b').textContent.trim();

      const rating = container.querySelector('.strs').textContent.trim(); // fix this
      
      const votes = container.children[4].lastElementChild.textContent.trim();
      const matches = container.children[6].lastElementChild.textContent.trim();
      const preview = pb2_url + container.getElementsByTagName('img')[0].src;
      const desc = container.children[10].lastElementChild.textContent.trim();
      const video = container.children[12].lastElementChild.textContent.trim();
      const approved_icon = pb2_url + container.getElementsByTagName('img')[1].src;
      const max_players = container.children[15].lastElementChild.textContent.trim();
      const map_creator = container.children[17].getElementsByTagName('a')[0].textContent.trim();
      const map_creator_link = container.children[17].getElementsByTagName('a')[0].href;
      const map_demo = container.children[20].getElementsByTagName('a')[0].textContent.trim();

      map_info.setColor(role_color)
              .setAuthor(map_name + ` (${map_id})`, pb2_icon)
              .setTitle('Map Link')
              .setURL(map_ref)
              
              .setThumbnail(pb2_icon)

              .setImage(encodeSpaces(preview))

              .addField('Description', desc + '\n\u200B')

              .addField('Votes', votes, true)
              .addField('Max Players', max_players, true)
              .addField('Map Creator', `[${map_creator}](${encodeSpaces(pb2_url + map_creator_link)} "${map_creator}")\n\u200B`, true)
              .addField('Matches Started', matches, true)

              .addField('Walkthrough Video', video)
              .addField('Demo Link', `[${map_demo}](${encodeSpaces(map_demo)})`)

              .setFooter(client.user.tag, client.user.avatarURL)
              .setTimestamp(new Date());

      // console.log(map_info.image.url);

      message.channel.send(map_info).then(() => {
        message.channel.stopTyping();
      }).catch(err => {
        console.log(err);
        message.channel.stopTyping(true);
      });
    }
  });
});
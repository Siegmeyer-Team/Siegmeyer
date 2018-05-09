const Discord = require('discord.js');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.run = ((client, message, args) => {
  const role_color = !message.guild.me.displayColor ? 12172222 : message.guild.me.displayColor;

  const pb2_url = 'https://plazmaburst2.com/';
  const pb2_lists_url = pb2_url + '?s=4&pg=';
  const pb2_server = client.guilds.get('328650645793931267');
  const pb2_icon = pb2_server ? pb2_server.iconURL : 'https://cdn.discordapp.com/icons/328650645793931267/cb212d87fd062eb467540febea1f73a3.png';

  const staff_url = pb2_url + '?s=4&pg=6';

  const get_staff_team = (d => {
    var header = d.querySelectorAll('table[border="0"].sg')[0],
        current_node = header.nextElementSibling.nextElementSibling,
        staff_avatar, staff_role, staff_name;
    
    var staff_team = {};
  
    for (let i = 0; current_node && current_node.tagName.toLowerCase() == 'table'; current_node = current_node.nextElementSibling) {
      staff_avatar = pb2_url + current_node.querySelector('td > img').src;
      staff_role = current_node.querySelector('span[style$="font-weight:bold;"]').textContent.trim();
      staff_name = current_node.querySelector('td b > font').textContent.trim();

      if (!staff_team[staff_role]) staff_team[staff_role] = [];
      staff_team[staff_role].push({ avatar: staff_avatar, name: staff_name });
    }
    
    return staff_team;
  });
  
  const encodeSpaces = (player => player.replace(/\u200b/g, '').replace(/\s/g, '%20'));

  message.channel.startTyping();

  request(staff_url, function(err, res, body) {
    if (err) return console.log(err);

    if (res && res.statusCode == 200) {
      const document = new JSDOM(body).window.document;
      const staff_team = get_staff_team(document);
      const staff_list = new Discord.RichEmbed();

      staff_list.setColor(role_color)
                .setAuthor('Plazma Burst 2 Site Staff', pb2_icon)
                // .setTitle('Plazma Burst 2 Site link')
                // .setURL(staff_url)
                .setDescription('- Members of the Plazma Burst 2 Staff Team.')
                .setThumbnail(pb2_icon)
                .setFooter(client.user.tag, client.user.avatarURL)
                .setTimestamp(new Date());
      
      for (staff in staff_team) {
        let formatted = staff_team[staff].map((v, i) => {
          return '[' + v.name + '](' + pb2_url + '?s=7&ac=' + encodeSpaces(v.name) + ')'
        });

        staff_list.addField(
          // Name
          '__' + staff + ' Team:__ ',
          // Value
          formatted.join(', ')
        );
      }

      message.channel.send(staff_list).then(() => {
        message.channel.stopTyping();
      });
    }
  });
});
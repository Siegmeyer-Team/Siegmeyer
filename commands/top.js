/***
 * 
 * THIS COMMAND IS MADE TO PULL LEADERBOARD DATA FROM WWW (DOT) PLAZMABURST2 (DOT) COM
 * SPECIAL THANKS TO BLAKE, SHROOM, AND GOOGLE FOR HELPING
 * 
 *  par Izanagi#5715 <@191333046786588672> - Enjoy
 * 
 ***/

const Discord = require('discord.js');
const request = require('request');
const config = require('../config.json');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// available arguments
const top_lists = ['pl_players', 'pl_teams', 'players', 'challengers', 'level_devs'];

// when set to true, the bot stops typing abruptly
const stop_typing = false;

exports.run = ((client, message, args) => {
  const list = args[0];
  // sets the role color if there is none
  const role_color = !message.guild.me.displayColor ? 12172222 : message.guild.me.displayColor;
  
  const pb2_url = 'https://plazmaburst2.com/';
  const pb2_lists_url = pb2_url + '?s=4&pg=';
  const pb2_server = client.guilds.get('328650645793931267');
  const pb2_icon = pb2_server ? pb2_server.iconURL : 'https://cdn.discordapp.com/icons/328650645793931267/cb212d87fd062eb467540febea1f73a3.png';

  const pl_server = client.guilds.get('310995545588105217');
  const pl_icon = pl_server ? pl_server.iconURL : '';

  if (!top_lists.length) return message.channel.send('There are no available lists.');

  var no_args_message = 'The available list' + (top_lists.length > 1 ? 's are' : ' is') + ':' +
      '```fix\n' + top_lists.join('\n') + '```\nUse `' + config.prefix + 'top [list name]` to pull a list of players.';

  // if there are no args or if the args dont match one of the available arguments
  if (!args.length || !top_lists.includes(list)) return message.channel.send(no_args_message);

  // starts typing
  message.channel.startTyping();

  // decodes a certain uri and encodes spaces
  const encodeSpaces = (player => player.replace(/\u200b/g, '').replace(/\s/g, '%20'));
  
  // splices text and adds ellipses
  const ellipsify = ((player, max_chars) => {
    return player.length <= max_chars ? player : player.substring(0, max_chars - 3) + '...';
  });

  // 1 -> 1st
  // 2 -> 2nd and so on
  const placement_suffix = (position => {
    switch (true) {
      case (position % 10 == 1 && position != 11): position += 'st'; break;
      case (position % 10 == 2 && position != 12): position += 'nd'; break;
      case (position % 10 == 3 && position != 13): position += 'rd'; break;
      default: position += 'th'
    }

    return position;
  });

  // appends zeros where needed
  const points_parser = ((points, length) => {
    if (!length) length = 4;
    while (points.toString().length < length) points.indexOf('.') < 0 ? points += '.' : points += '0';
    return points;
  });

  // fixes [1, 2, 3, ..., 11, 12, 13] =>
  //       [1, 11, 2, 12, 3, 13, ...]
  const interleave = (array => {
    const top_ten = array.splice(0, array.length / 2);
    const new_array = top_ten.map((v, i) => [v, array[i]]).reduce((a, b) => a.concat(b));
    
    return new_array;
  });

  /* - Start - */

  if (list == 'pl_players') {
    const url = pb2_lists_url + '11';
    
    const get_top_players = (d => {
      var header = d.querySelectorAll('table[border="0"].sg')[1],
          current_node = header.nextElementSibling.nextElementSibling,
          player_avatar, player_name, player_team, player_points;
      
      var top_players = {};
    
      for (let i = 0; current_node.tagName.toLowerCase() == 'table'; current_node = current_node.nextElementSibling) {
        player_avatar = pb2_url + current_node.querySelector('td > img').src;
        player_name = current_node.querySelector('td b > font').textContent.trim();
        player_team = current_node.querySelector('span[title="Plazma League team"]').textContent.trim();
        player_points = current_node.querySelector('span[title="Plazma League Points"]').textContent.trim();
        
        top_players[++i] = { avatar: player_avatar, name: player_name, team: player_team, points: player_points };
      }
      
      return top_players;
    });
    
    request(url, function(err, res, body) {
      // console.log('Connecting to www.plazmaburst2.com...');
      if (err) return console.log(err);
    
      if (res && res.statusCode == 200) {
        const document = new JSDOM(body).window.document;
        const top_pl_players = get_top_players(document);
        const player_list = new Discord.RichEmbed();

        player_list.setColor(role_color)
                    .setAuthor('Top 20 Plazma League Players', pl_icon)
                    .setTitle('Plazma Burst 2 Site link')
                    .setURL(url)
                    .setDescription('- The best players of the Plazma League.')
                    .setThumbnail(pl_icon)
                    .setFooter(client.user.tag, client.user.avatarURL)
                    .setTimestamp(new Date())


        for (let player in top_pl_players) {

          player_list.addField(
            // Name
            player + ': [' + top_pl_players[player].team + ']',
            // Value
            '[' + ellipsify(top_pl_players[player].name.trim(), 12).replace(/\s/g, '\\_') + ']' +
            '(' + pb2_url + '?s=7&ac=' + encodeSpaces(top_pl_players[player].name) +
            ' "' + top_pl_players[player].name.trim() + '")' +
            ' - **' + Math.round(top_pl_players[player].points) + '** Points',
            // Inline
            true
          );
        }

        player_list.fields = interleave(player_list.fields);

        message.channel.send(player_list).then(() => {
          message.channel.stopTyping(stop_typing);
        });
      }
    });

  } else if (list == 'pl_teams') {
    const url = pb2_lists_url + '11';
    
    const get_top_teams = (d => {
      var header = d.querySelectorAll('table[border="0"].sg')[0],
        current_node = header.nextElementSibling.nextElementSibling,
        team_name, team_wins, team_losses;

      var top_teams = {};

      for (let i = 0; current_node.tagName.toLowerCase() == 'table'; current_node = current_node.nextElementSibling) {
        team_name = current_node.querySelector('span[title="Plazma League team"]').textContent.trim();
        team_wins = current_node.getElementsByTagName('tr')[0].children[3].textContent.trim();
        team_losses = current_node.getElementsByTagName('tr')[0].children[4].textContent.trim();
        
        top_teams[++i] = { name: team_name, wins: team_wins, losses: team_losses };
      }

      return top_teams;
    });

    request(url, function(err, res, body) {
      // console.log('Connecting to www.plazmaburst2.com...');
      if (err) return console.log(err);
    
      if (res && res.statusCode == 200) {
        const document = new JSDOM(body).window.document;
        const top_pl_teams = get_top_teams(document);
        const teams_list = new Discord.RichEmbed();
  
        teams_list.setColor(role_color)
                    .setAuthor('Top 20 Plazma League Teams', pl_icon)
                    .setTitle('Plazma Burst 2 Site link')
                    .setURL(url)
                    .setDescription('- Plazma League team rankings.')
                    .setThumbnail(pl_icon)
                    .setFooter(client.user.tag, client.user.avatarURL)
                    .setTimestamp(new Date())
  
  
        for (let team in top_pl_teams) {
  
          teams_list.addField(
            // Name
            '__' + placement_suffix(team) + ' - ' + top_pl_teams[team].name.trim() + '__',
            // Value
            ' **' + top_pl_teams[team].wins + '**' + ' wins - ' +
            '**' + top_pl_teams[team].losses + '**' +  ' losses',
            // Inline
            true
          );
        }
        
        teams_list.fields = interleave(teams_list.fields);
  
        message.channel.send(teams_list).then(() => {
          message.channel.stopTyping(stop_typing);
        });
      }
    });

  } else if (list == 'players') {
    const url = pb2_lists_url + '0';

    const get_top_players = (d => {
      var header = d.querySelectorAll('table[border="0"].sg')[1],
          current_node = header.nextElementSibling.nextElementSibling,
          player_avatar, player_name, player_points;
      
      var top_players = {};
    
      for (let i = 0; parseInt(current_node.querySelector('td:first-child').textContent) < 21; current_node = current_node.nextElementSibling) {
        player_avatar = pb2_url + current_node.querySelector('td > img').src;
        player_name = current_node.querySelector('td b > font').textContent.trim();
        player_points = current_node.querySelector('span[title="Player Points"]').textContent.trim();
        
        top_players[++i] = { avatar: player_avatar, name: player_name, pp: player_points };
      }
      
      return top_players;
    });

    request(url, function(err, res, body) {
      // console.log('Connecting to www.plazmaburst2.com...');
      if (err) return console.log(err);
    
      if (res && res.statusCode == 200) {
        const document = new JSDOM(body).window.document;
        const top_players = get_top_players(document);
        const player_list = new Discord.RichEmbed();
  
        player_list.setColor(role_color)
                    .setAuthor('Top 20 Best Players', pb2_icon)
                    .setTitle('Plazma Burst 2 Site link')
                    .setURL(url)
                    .setDescription('The best players of the game.')
                    .setThumbnail(pb2_icon)
                    .setFooter(client.user.tag, client.user.avatarURL)
                    .setTimestamp(new Date());
  
  
        for (let player in top_players) {
  
          player_list.addField(
            // Name
            placement_suffix(player) + ' - ' + ellipsify(top_players[player].name, 18),
            // Value
            ' [[PB2 profile]](' + pb2_url + '?s=7&ac=' + encodeSpaces(top_players[player].name) + ')' +
            ' - **' + points_parser(top_players[player].pp) + '** PP' ,
            // Inline
            true
          );
        }
        
        player_list.fields = interleave(player_list.fields);
  
        message.channel.send(player_list).then(() => {
          message.channel.stopTyping(stop_typing);
        });
      }
    });

  } else if (list == 'challengers') {
    const url = pb2_lists_url + '9';

    const get_top_players = (d => {
      var header = d.querySelectorAll('table[border="0"].sg')[0],
          current_node = header.nextElementSibling.nextElementSibling,
          player_avatar, player_name, player_points;
      
      var top_players = {};
    
      for (let i = 0; parseInt(current_node.querySelector('td:first-child').textContent) < 21; current_node = current_node.nextElementSibling) {
        player_avatar = pb2_url + current_node.querySelector('td > img').src;
        player_name = current_node.querySelector('td b > font').textContent.trim();
        player_points = current_node.querySelector('span[title="Predicted Player Points"]').textContent.trim();
        
        top_players[++i] = { avatar: player_avatar, name: player_name, ppp: player_points };
      }
      
      return top_players;
    });

    request(url, function(err, res, body) {
      // console.log('Connecting to www.plazmaburst2.com...');
      if (err) return console.log(err);
    
      if (res && res.statusCode == 200) {
        const document = new JSDOM(body).window.document;
        const top_players = get_top_players(document);
        const player_list = new Discord.RichEmbed();
  
        player_list.setColor(role_color)
                    .setAuthor('Top 20 Challengers', pb2_icon)
                    .setTitle('Plazma Burst 2 Site link')
                    .setURL(url)
                    .setDescription('- Players who are on [their way to] the Top 20 Best Players.')
                    .setThumbnail(pb2_icon)
                    .setFooter(client.user.tag, client.user.avatarURL)
                    .setTimestamp(new Date())
  
  
        for (let player in top_players) {
  
          player_list.addField(
            // Name
            placement_suffix(player) + ' - ' + ellipsify(top_players[player].name, 18),
            // Value
            ' [[PB2 profile]](' + pb2_url + '?s=7&ac=' + encodeSpaces(top_players[player].name) + ')' +
            ' - **' + points_parser(top_players[player].ppp) + '** PPP' ,
            // Inline
            true
          );
        }
        
        player_list.fields = interleave(player_list.fields);
  
        message.channel.send(player_list).then(() => {
          message.channel.stopTyping(stop_typing);
        });
      }
    });

  } else if (list == 'level_devs') {
    const url = pb2_lists_url + '5';

    const get_top_level_devs = (d => {
      var header = d.querySelectorAll('table[border="0"].sg')[0],
          current_node = header.nextElementSibling.nextElementSibling,
          dev, dev_avatar, dev_name, dev_rank;
      
      var top_level_devs = {};
    
      for (let i = 0; parseInt(current_node.querySelector('td:first-child').textContent) < 21; current_node = current_node.nextElementSibling) {
        dev = current_node.querySelector('tr'),
        dev_avatar = pb2_url + dev.querySelector('td > img').src;
        dev_name = dev.querySelector('td b > font').textContent.trim();
        dev_rank = dev.children[dev.children.length - 2].textContent.trim();
        
        top_level_devs[++i] = { avatar: dev_avatar, name: dev_name, rank: dev_rank };
      }
      
      return top_level_devs;
    });

    request(url, function(err, res, body) {
      // console.log('Connecting to www.plazmaburst2.com...');
      if (err) return console.log(err);
    
      if (res && res.statusCode == 200) {
        const document = new JSDOM(body).window.document;
        const top_level_devs = get_top_level_devs(document);
        const level_dev_list = new Discord.RichEmbed();
  
        level_dev_list.setColor(role_color)
                    .setAuthor('Top 20 Best Level Developers', pb2_icon)
                    .setTitle('Plazma Burst 2 Site link')
                    .setURL(url)
                    .setDescription('- The best level developers of the game.')
                    .setThumbnail(pb2_icon)
                    .setFooter(client.user.tag, client.user.avatarURL)
                    .setTimestamp(new Date())
  
  
        for (let level_dev in top_level_devs) {
          var id = '';
  
          level_dev_list.addField(
            // Name
            placement_suffix(level_dev) + ' - ' + ellipsify(top_level_devs[level_dev].name, 20),
            // Value
            ' [[PB2 profile]](' + pb2_url + '?s=7&ac=' + encodeSpaces(top_level_devs[level_dev].name) + ')' +
            ' - **' + points_parser(top_level_devs[level_dev].rank, 5) + '** LDR' ,
            // Inline
            true
          );
        }
        
        level_dev_list.fields = interleave(level_dev_list.fields);
  
        message.channel.send(level_dev_list).then(() => {
          message.channel.stopTyping(stop_typing);
        });
      }
    });

  }
});
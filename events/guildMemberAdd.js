const devs = [
  // Shroom
  '118238886555156487',
  // Vesper
  '191333046786588672'
];

const servers = [
  // PB2 Official
  '328650645793931267',
  // PL Server
  '310995545588105217',
  // Dev Server
  '362729317077221377'
];

exports.run = (client, member) => {
  console.log(`${member.user.tag} has joined ${member.guild.name} (at ${new Date()})`);
  if (!servers.includes(member.guild.id)) return;

  for (let i = 0; i < devs.length; i++) {
    client.fetchUser(devs[i]).then(user => {
      user.send(`<@${member.user.id}> has joined ${member.guild.name} (at ${new Date()})`);
    });
  }
}
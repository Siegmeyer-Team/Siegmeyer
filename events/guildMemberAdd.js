const devs = [
  // Shroom
  '118238886555156487',
  // Vesper
  '191333046786588672'
];

exports.run = (client, member) => {
  for (let i = 0; i < devs.length; i++) {
    client.fetchUser(devs[i]).then(user => {
      user.send('<@' + member.user.id + '> has joined ' + member.guild.name + '(' + member.guild.id + ')');
    });
  }
}
function getValueFromTag (xmlDoc,tag) {
  if (xmlDoc.getElementsByTagName(tag).length != 0 ) {
    if (xmlDoc.getElementsByTagName(tag)[0].childNodes.length == 0) {
      return '';
    } else {
      return xmlDoc.getElementsByTagName(tag)[0].childNodes[0].nodeValue;
    }
  } else {
    return '';
  }
}
function getCountry(country) {
  var count = iso.findCountryByName(country);
  if (!count)
    count = iso.findCountryByCode(country);
  if (!count) {
    return "unknown";
  }
  return count['value'].toUpperCase();
}
function getSmashChar(smashChar) {
  return smashChar + (isNaN(parseInt(smashChar.slice(-1)))?'1':'')
}

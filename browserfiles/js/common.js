/**
 * Copyright 2018 Miguel Müller
 * 
 * This file is part of Shieldbreakers-StreamControl-setup.
 *
 * Shieldbreakers-StreamControl-setup is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Shieldbreakers-StreamControl-setup is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 * Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Shieldbreakers-StreamControl-setup.  If not, see <http://www.gnu.org/licenses/>.
 */

const CHAR_HEIGHT = 74;
const CHAR_WIDTH = CHAR_HEIGHT; //assuming src imgs are quadratic
const CHAR_CROPPED_HEIGHT = 58;

let charRect = new createjs.Rectangle(0, 0, 100, CHAR_CROPPED_HEIGHT); //works if img width is <= 100

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

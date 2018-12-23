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

const xhr = new XMLHttpRequest();
xhr.overrideMimeType('text/xml');
let animating = false;
let doUpdate = false;

let timestamp;
let timestampOld;
let dynamicTexts = new Map();
function newDynText(name, x, y, maxWidth, fontsize, fontcolor) {
  let dynamicText = new createjs.Text(
    "",
    `${fontsize}px Helvetica`,
    fontcolor
  );
  dynamicText.x = x;
  dynamicText.y = y;
  dynamicText.maxWidth = maxWidth;
  dynamicText.textAlign = "center";
  dynamicTexts.set(name, dynamicText);
  return dynamicText;
}
function addMirroredDynamicText(name, mirrorName) {
  let dynamicText = dynamicTexts.get(mirrorName).clone();
  dynamicText.x = $("myCanvas").attr("width") - dynamicText.x;
  dynamicTexts.set(name, dynamicText);
  //clones parent?
  //board.addChild(dynamicText);
}

function pollHandler() {
  xhr.open('GET', 'streamcontrol.xml');
  xhr.send();
  xhr.onreadystatechange = function() {
    let xmlDoc = xhr.responseXML;
    if (xmlDoc != null) {
      timestampOld = timestamp;
      timestamp = getValueFromTag(xmlDoc, 'timestamp');
      if (timestamp != timestampOld) {
        doUpdate = true;
      }
      if (!animating && doUpdate) {
        dynamicTexts.forEach(updateText);
        doUpdate = false;
      }
    }
  }
}

function updateText(dynamicText, name, dynTexts) {
  let newText = getValueFromTag(xhr.responseXML, name);
  if (dynamicText.text != newText) {
    animating = true;
    createjs.Tween.get(dynamicText)
      .to({alpha:0},500,createjs.Ease.quintIn)
      .call(function() {
        dynamicText.text = newText;

        //fade losing player in bracket overlay
        let opponentDynText = dynTexts.get(name.substr(0, name.length-2) + "1s");
        if (name.endsWith("p2s") && opponentDynText != undefined) {
          let oppSc = parseInt(opponentDynText.text);
          let oppNa = dynTexts.get(name.substr(0, name.length-2) + "1");
          let myName = dynTexts.get(name.substr(0, name.length-1));
          if (oppSc < parseInt(newText)) {
            oppNa.color = losecolor;
            myName.color = fontcolor;
          } else if (oppSc > parseInt(newText)) {
            oppNa.color = fontcolor;
            myName.color = losecolor;
          } else {
            oppNa.color = fontcolor;
            myName.color = fontcolor;
          }
        }
      })
      .to({alpha:1},500,createjs.Ease.quintOut)
      .call(function() {animating = false;});
  }
}

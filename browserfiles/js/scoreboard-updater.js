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

//Depends on easeljs, tweenjs.

const SCORE_X = 814;
const SCORE_Y = 12;
const SCORE_MAX_WIDTH = 42;
const SCORE_FONT_SIZE = 32;

const ROUND_X = 960;
const ROUND_Y = 11;
const ROUND_MAX_WIDTH = 220;
const ROUND_FONT_SIZE = 22;

const CHAR_PATH = "images/smash_ultimate/";
let CHAR_HEIGHT = 90;
let CHAR_WIDTH = CHAR_HEIGHT; //assuming src imgs are quadratic
let CHAR_CROPPED_HEIGHT = 62;

let charRect = new createjs.Rectangle(0, 0, 100, CHAR_CROPPED_HEIGHT); //works if img width is <= 100
let charRectTopCropped = new createjs.Rectangle(0, 10, 100, CHAR_CROPPED_HEIGHT); //used for mario & meta knight
    
const xhr = new XMLHttpRequest();
xhr.overrideMimeType('text/xml');
let animating = false;
let doUpdate = false;

let timestamp;
let timestampOld;
let dynamicTexts = new Map();
let dynamicImages = new Map();
let paths = new Map();
let stage;
function initDoubles() {
  CHAR_HEIGHT = 75;
  CHAR_WIDTH = CHAR_HEIGHT;
  CHAR_CROPPED_HEIGHT = 75;
  charRect = new createjs.Rectangle(0, 0, 100, CHAR_CROPPED_HEIGHT); //works if img width is <= 100
  charRectTopCropped = new createjs.Rectangle(0, 10, 100, CHAR_CROPPED_HEIGHT); //used for mario & meta knight
}
function createScoreboard(board) {
  var timeout = this.window.setInterval(function() {
    pollHandler();
  }, 250);

  stage = new createjs.Stage("myCanvas");
  board.y = -100;
  stage.addChild(board);
  animating = true;
  createjs.Tween.get(board).to({y:0},800, createjs.Ease.quintOut);

  createjs.Ticker.addEventListener("tick", enterFrame);
  createjs.Ticker.framerate = 60;

  stage.update();
}
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
  dynamicText.textBaseline = "hanging";
  dynamicTexts.set(name, dynamicText);
  return dynamicText;
}
function newMirroredDynText(name, mirrorName) {
  let dynamicText = dynamicTexts.get(mirrorName).clone();
  dynamicText.x = document.getElementById("myCanvas").width - dynamicText.x;
  dynamicTexts.set(name, dynamicText);
  return dynamicText;
}
function newDynImage(name, x, y, path) {
  let dynamicImage = new createjs.Container();
  dynamicImage.x = x;
  dynamicImage.y = y;
  dynamicImage.name = "";
  paths.set(name, path);
  dynamicImages.set(name, dynamicImage);
  return dynamicImage;
}
function newMirroredDynImage(name, mirrorName) {
  let dynamicImage = dynamicImages.get(mirrorName).clone();
  let path = paths.get(mirrorName);
  dynamicImage.x = document.getElementById("myCanvas").width - (path==CHAR_PATH?CHAR_WIDTH:FLAG_WIDTH) - dynamicImage.x;
  paths.set(name, paths.get(mirrorName));
  dynamicImages.set(name, dynamicImage);
  return dynamicImage;
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
      if (doUpdate && (!animating || timestampOld == null)) {
        dynamicTexts.forEach(updateText);
        dynamicImages.forEach(updateImage);
        doUpdate = false;
      }
    }
  }
}

function updateText(dynamicText, name, dynTexts) {
  let newText = getValueFromTag(xhr.responseXML, name);
  if (dynamicText.name != null) {
      newText = getTeamName(newText, getValueFromTag(xhr.responseXML, dynamicText.name));
  }
  if (dynamicText.text != newText) {
    animating = true;
    createjs.Tween.get(dynamicText)
      .to({alpha:0},500,createjs.Ease.quintIn)
      .call(function() {
        dynamicText.text = newText;
      })
      .to({alpha:1},500,createjs.Ease.quintOut)
      .call(function() {animating = false;});
  }
}

function updateImage(dynamicImage, name, dynImages) {
  let path = paths.get(name);
  let newFileName = getValueFromTag(xhr.responseXML, name);
  if (typeof FLAG_PATH !== 'undefined' && path == FLAG_PATH)
    newFileName = getCountry(newFileName);
  if (dynamicImage.name != newFileName) {
    animating = true;
    let prevAlpha = dynamicImage.alpha;
    let bitmap = new createjs.Bitmap(path + newFileName + ".png");
    createjs.Tween.get(dynamicImage).to({alpha:0},500, createjs.Ease.quintIn).call(function() {
      dynamicImage.removeAllChildren();
      if (bitmap.image.height != 0) { //image exists
        if (path == CHAR_PATH) {
          if (newFileName.startsWith("mario") || newFileName.startsWith("metaknight")) {
            bitmap.sourceRect = charRectTopCropped;
          } else {
            bitmap.sourceRect = charRect;
          }
          bitmap.scale = CHAR_HEIGHT / bitmap.image.height;
        } else {
          bitmap.scale = FLAG_WIDTH / bitmap.image.width;
        }
        dynamicImage.addChild(bitmap);
      }
      dynamicImage.name = newFileName;
    })
      .to({alpha:prevAlpha},500, createjs.Ease.quintOut).call(function() {animating = false;});
  }
}

function enterFrame(event) {
  if (animating)
    stage.update(event);
}

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
  if (country.length === 0) {
    return country;
  }
  var count = iso.findCountryByName(country);
  if (!count)
    count = iso.findCountryByCode(country);
  if (!count) {
    return "unknown";
  }
  return count['value'].toUpperCase();
}
function getTeamName(name1, name2) {
  return name1 + (name2==""?"":(" / "+name2));
}

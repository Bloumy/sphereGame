var TextLevel = require('./TextLevel.js');
var BarLevel = require('./BarLevel.js');

var Level = function (ship, side) {
    this.ship = ship;
    this.scene = ship.scene;

    this.level = 1;
    this.maxLevel = 100;

    this.currentXp = 0;
    this.totalXpForNextLevel = 10;

    if (side === 'left') {
        this.position = {x: -3000, y: 100, z: 1000};
    }
    if (side === 'right') {
        this.position = {x: 2000, y: 100, z: 1000};
    }

    this.textLevel = new TextLevel(this, this.level);
    this.barLevel = new BarLevel(this, 0);
};

Level.prototype.update = function () {

    var point1 = {
        x: this.position.x + 0,
        y: this.position.y - 200
    };

    var point2 = {
        x: this.position.x + 0,
        y: this.position.y + -100
    };

    var point3 = {
        x: this.position.x + 1 + (1000 * this.currentXp / this.totalXpForNextLevel),
        y: this.position.y - 100
    };

    var point4 = {
        x: this.position.x + 1 + (1000 * this.currentXp / this.totalXpForNextLevel),
        y: this.position.y + -200
    };

    this.barLevel.levelXPBar.geometry.vertices[0].x = point1.x;
    this.barLevel.levelXPBar.geometry.vertices[0].y = point1.y;

    this.barLevel.levelXPBar.geometry.vertices[1].x = point2.x;
    this.barLevel.levelXPBar.geometry.vertices[1].y = point2.y;

    this.barLevel.levelXPBar.geometry.vertices[2].x = point3.x;
    this.barLevel.levelXPBar.geometry.vertices[2].y = point3.y;

    this.barLevel.levelXPBar.geometry.vertices[3].x = point4.x;
    this.barLevel.levelXPBar.geometry.vertices[3].y = point4.y;

    this.barLevel.levelXPBar.geometry.verticesNeedUpdate = true;

};

module.exports = Level;
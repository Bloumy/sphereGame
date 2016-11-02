var Ship = require('./Ship.js');

var EnnemiShip = function (scene, mesh, parameters) {

    this.ship = new Ship(scene, mesh, parameters);


    if (!this.ship.scene.ennemies) {
        this.ship.scene.ennemies = [];
    }
    this.ship.scene.ennemies.push(this);


    if (parameters) {

        if (parameters['popPosition']) {
            this.ship.popPosition = parameters['popPosition'];
        } else {
            this.ship.popPosition = this.getDefaultPopPosition();
        }


        if (parameters['autoDeplacements']) {
            this.ship.autoDeplacements = parameters['autoDeplacements'];
        } else {
            this.ship.autoDeplacements = this.getDefaultAutoDeplacements();
        }

        if (parameters['gainExp']) {
            this.gainExp = parameters['gainExp'];
        } else {
            this.gainExp = this.getDefaultGainExp();
        }

    }

    this.ship.initStartPosition(this.ship.popPosition);
    this.ship.addLifeBar();

    return this.ship;
};


EnnemiShip.prototype.getDefaultGainExp = function () {
    if (this.gainExp) {
        return this.gainExp;
    }

    return 1;
};

EnnemiShip.prototype.getDefaultAutoDeplacements = function () {
    if (this.autoDeplacements) {
        return this.autoDeplacements;
    }
    var listOfMove = {0: 'down', 1: 'right', 2: 'up', 3: 'left'};
    return {
        0: 'down',
        2000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        4000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        6000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        8000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        10000: 'down'
    };
};

/**
 * @description Renvoie la position de la position initiale d'un ennemi
 * actuellement le comportement est : random sur l'axe x, tout en haut sur l'axe y, 0 sur l'axe z
 * @returns {object}
 */
EnnemiShip.prototype.getDefaultPopPosition = function () {
    if (this.ship.popPosition) {
        return this.ship.popPosition;
    }

    return {
        x: ((Math.random() * (this.ship.scene.gameBoundLimit.maxX - this.ship.scene.gameBoundLimit.minX)) + 1) + this.ship.scene.gameBoundLimit.minX,
        y: this.ship.scene.gameBoundLimit.maxY,
        z: this.ship.scene.gameBoundLimit.minZ
    };
};


EnnemiShip.prototype.setPosition = function (x, y, z) {

    if (x < this.ship.scene.gameBoundLimit.minX) {
        x = this.ship.scene.gameBoundLimit.minX;
    }
    if (x > this.ship.scene.gameBoundLimit.maxX) {
        x = this.ship.scene.gameBoundLimit.maxX;
    }

    if (y < this.ship.scene.gameBoundLimit.minY) {
        y = this.ship.scene.gameBoundLimit.minY;
    }
    if (y > this.ship.scene.gameBoundLimit.maxY) {
        y = this.ship.scene.gameBoundLimit.maxY;
    }

    if (z < this.ship.scene.gameBoundLimit.minZ) {
        z = this.ship.scene.gameBoundLimit.minZ;
    }
    if (z > this.ship.scene.gameBoundLimit.maxZ) {
        z = this.ship.scene.gameBoundLimit.maxZ;
    }

    this.ship.mesh.position.x = x;
    this.ship.mesh.position.y = y;
    this.ship.mesh.position.z = z;
};



EnnemiShip.prototype.animate = function () {
    this.ship.animateAutoDeplacements();
    this.ship.lifeBar.updatePosition();
};



EnnemiShip.prototype.destroy = function (ship) {

    if (ship) {
        ship.addExp(this.gainExp);
    }
    this.ship.scene.remove(this.ship.mesh);
    this.lifeBar.destroy();

    for (var key in this.ship.scene.ennemies) {
        if (this.ship.scene.ennemies[key] === this) {
            this.ship.scene.ennemies.splice(key, 1);
        }
    }

};


module.exports = EnnemiShip;
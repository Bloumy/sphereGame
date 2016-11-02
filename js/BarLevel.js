var BarLevel = function (levelItem) {


    this.levelItem = levelItem;

    this.addFontBar();
    this.addXPBar();
};

BarLevel.prototype.addFontBar = function () {

    //cadre
    var rectShapeBase = new THREE.Shape();

    var point1 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y - 200
    };

    var point2 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y + -100
    };

    var point3 = {
        x: this.levelItem.position.x + 1000,
        y: this.levelItem.position.y - 100
    };

    var point4 = {
        x: this.levelItem.position.x + 1000,
        y: this.levelItem.position.y + -200
    };

    rectShapeBase.moveTo(point1.x, point1.y);

    rectShapeBase.lineTo(point2.x, point2.y);
    rectShapeBase.lineTo(point3.x, point3.y);
    rectShapeBase.lineTo(point4.x, point4.y);
    rectShapeBase.lineTo(point1.x, point1.y);


    var geometry = new THREE.ShapeGeometry(rectShapeBase);

    var material = new THREE.LineBasicMaterial({
        color: 0xffffff
    });

    this.levelFontBar = new THREE.Mesh(geometry, material);
    this.levelFontBar.position.z = this.levelItem.position.z;
    this.levelItem.scene.add(this.levelFontBar);
};

BarLevel.prototype.addXPBar = function () {

    //cadre
    var rectShapeBase = new THREE.Shape();

    var point1 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y - 200
    };

    var point2 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y + -100
    };

    var point3 = {
        x: this.levelItem.position.x + 1 + (1000 * this.levelItem.currentXp / this.levelItem.totalXpForNextLevel),
        y: this.levelItem.position.y - 100
    };

    var point4 = {
        x: this.levelItem.position.x + 1 + (1000 * this.levelItem.currentXp / this.levelItem.totalXpForNextLevel),
        y: this.levelItem.position.y + -200
    };

    rectShapeBase.moveTo(point1.x, point1.y);

    rectShapeBase.lineTo(point2.x, point2.y);
    rectShapeBase.lineTo(point3.x, point3.y);
    rectShapeBase.lineTo(point4.x, point4.y);
    rectShapeBase.lineTo(point1.x, point1.y);

    var geometry = new THREE.ShapeGeometry(rectShapeBase);
    var material = new THREE.LineBasicMaterial({
        color: 'gold'
    });

    this.levelXPBar = new THREE.Mesh(geometry, material);
    this.levelXPBar.position.z = this.levelItem.position.z;
    this.levelItem.scene.add(this.levelXPBar);
};

module.exports = BarLevel;
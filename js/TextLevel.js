var TextLevel = function (levelItem) {
    this.levelItem = levelItem;

    this.textLevel = 'Niveau ' + this.levelItem.level;

    var loader = new THREE.FontLoader();
    var self = this;
    loader.load(URL_FONT, function (font) {
        self.initFont(font);
    });

};

TextLevel.prototype.initFont = function (font) {
    if (!this.font) {
        this.font = font;
    }

    if (this.mesh) {
        this.levelItem.scene.remove(this.mesh);
    }

    var material = new THREE.MeshPhongMaterial({
        color: 0xdddddd
    });

    var textGeom = new THREE.TextGeometry('Niveau ' + this.levelItem.level, {
        size: 160,
        height: 60,
        font: font,
        color: 'red',
        fontName: 'helvetiker',
        weight: 'normal',
        style: 'normal'
    });

    this.mesh = new THREE.Mesh(textGeom, material);

    this.mesh.position.x = this.levelItem.position.x + 100;
    this.mesh.position.y = this.levelItem.position.y;
    this.mesh.position.z = this.levelItem.position.z;


    this.levelItem.scene.add(this.mesh);
};


TextLevel.prototype.update = function () {
    this.initFont(this.font);
};

module.exports = TextLevel;
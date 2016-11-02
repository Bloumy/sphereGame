var LifeBar = function (itemRattached, maxLife, currentLife) {
    this.itemRattached = itemRattached;

    if (!maxLife) {
        maxLife = 10;
    }

    if (!currentLife) {
        currentLife = maxLife;
    }

    this.itemRattached.hp = currentLife;
    this.itemRattached.maxHp = maxLife;

    var material = new THREE.LineBasicMaterial({
        color: 0xff0000
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
            new THREE.Vector3(this.itemRattached.mesh.position.x - 200, this.itemRattached.mesh.position.y - 400, this.itemRattached.mesh.position.z),
            new THREE.Vector3(this.itemRattached.mesh.position.x + 200, this.itemRattached.mesh.position.y - 400, this.itemRattached.mesh.position.z)
            );

    this.line = new THREE.Line(geometry, material);
    this.itemRattached.scene.add(this.line);

    //cadre
    var rectShape = new THREE.Shape();
    rectShape.moveTo(this.itemRattached.mesh.position.x - 220, this.itemRattached.mesh.position.y - 420);
    rectShape.lineTo(this.itemRattached.mesh.position.x - 220, this.itemRattached.mesh.position.y - 380);
    rectShape.lineTo(this.itemRattached.mesh.position.x + 220, this.itemRattached.mesh.position.y - 380);
    rectShape.lineTo(this.itemRattached.mesh.position.x + 220, this.itemRattached.mesh.position.y - 420);
    rectShape.lineTo(this.itemRattached.mesh.position.x - 220, this.itemRattached.mesh.position.y - 420);


    var geometry = new THREE.ShapeGeometry(rectShape);
    var material = new THREE.MeshBasicMaterial({color: 0x00ffff});
    this.lifeCadre = new THREE.Mesh(geometry, material);
    this.itemRattached.scene.add(this.lifeCadre);


};


LifeBar.prototype.destroy = function () {
    this.itemRattached.scene.remove(this.line);
    this.itemRattached.scene.remove(this.lifeCadre);
};

LifeBar.prototype.updatePosition = function () {

    this.line.geometry.vertices[0].x = this.itemRattached.mesh.position.x - 200;
    this.line.geometry.vertices[0].y = this.itemRattached.mesh.position.y - 400;
    this.line.geometry.vertices[0].z = this.itemRattached.mesh.position.z + 200;

    this.line.geometry.vertices[1].x = this.line.geometry.vertices[0].x + 400 * (this.itemRattached.hp / this.itemRattached.maxHp);
    this.line.geometry.vertices[1].y = this.line.geometry.vertices[0].y;
    this.line.geometry.vertices[1].z = this.line.geometry.vertices[0].z;

    this.line.geometry.verticesNeedUpdate = true;



    this.lifeCadre.geometry.vertices[0].x = this.itemRattached.mesh.position.x - 220;
    this.lifeCadre.geometry.vertices[0].y = this.itemRattached.mesh.position.y - 420;
    this.lifeCadre.geometry.vertices[0].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.vertices[1].x = this.itemRattached.mesh.position.x - 220;
    this.lifeCadre.geometry.vertices[1].y = this.itemRattached.mesh.position.y - 380;
    this.lifeCadre.geometry.vertices[1].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.vertices[2].x = this.itemRattached.mesh.position.x + 220;
    this.lifeCadre.geometry.vertices[2].y = this.itemRattached.mesh.position.y - 380;
    this.lifeCadre.geometry.vertices[2].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.vertices[3].x = this.itemRattached.mesh.position.x + 220;
    this.lifeCadre.geometry.vertices[3].y = this.itemRattached.mesh.position.y - 420;
    this.lifeCadre.geometry.vertices[3].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.verticesNeedUpdate = true;

};

module.exports = LifeBar;

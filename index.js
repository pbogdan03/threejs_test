(function() {
  var width = window.innerWidth,
      height = window.innerHeight,
      verticalMin = -15, // y start point of line
      verticalMax = 15, // y end point of line
      horizontalMin = -500, // x start point of line
      horizontalMax = 500, // x end point of line
      step = 1,
      lineSubdivs = 6,
      resolution = new THREE.Vector2(width, height),
      theta = 0,
      windowHalfX = width / 2,
      windowHalfY = height / 2,
      mouseX = 0,
      mouseY = 0,
      time = Date.now(),
      camera, renderer,
      gui, verticalMinCtrl, verticalMaxCtrl, horizontalMinCtrl, horizontalMaxCtrl, stepCtrl,
      i, j, k, l, m, n, o, p;

  var settings = {
    verticalMin: -15,
    verticalMax: 15,
    horizontalMin: -500,
    horizontalMax: 500,
    step: 1
  };

  init();

  function init() {
    // Add DOM Stuff
    var el = document.querySelector('#root');
    var container = document.createElement( 'div' );
    el.appendChild( container );

    // Setup this.camera
    camera = new THREE.PerspectiveCamera(
      33,
      width / height,
      1,
      10000
    );
    camera.position.z = 700;

    // Setup this.scene and this.renderer
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    renderer.autoClear = false;

    // Add the canvas to the DOM
    container.appendChild( renderer.domElement );

    // for(var i = 0; i < this.scene.children.length; i++) {
    //   var points = this.scene.children[i].geometry.attributes.position.array;
    //   for(var j = 0; j < points.length; j++) {
    //     if(j % 3 === 0) { //x
    //       points[j + 1] += 100;
    //     }
    //   }
    // }

    // var points = this.scene.children[0].geometry.attributes.position;
    //
    // console.log(this.scene.children[0].geometry.attributes.position);

    // Setup noise seed
    noise.seed(Math.random());

    // addGUI();
    animate();
    addEvents();
  }

  function addGUI() {
    gui = new dat.GUI();

    verticalMinCtrl = gui.add(settings, "verticalMin", -500, 500).step(step);
    verticalMaxCtrl = gui.add(settings, "verticalMax", -500, 500).step(step);
    horizontalMinCtrl = gui.add(settings, "horizontalMin", -500, 500).step(step);
    horizontalMaxCtrl = gui.add(settings, "horizontalMax", -500, 500).step(step);
    stepCtrl = gui.add(settings, "step", 0, 10).step(1);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    theta = Math.round((Date.now() - time) / 100);

    // Animate this.camera based on mouse position
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
    camera.lookAt( scene.position );

    // Clear this.scene on every render
    clearScene();
    // Recreate lines in new positions
    for (i = 0; i < 15; i++) {
      createLine(new THREE.Vector3(0, i * 10, 0), i, theta);
    }

    if(theta === 10) {

    }
    //
    // if(theta % 20 === 0) {
    //   console.log('iterate: ', iterate);
    //   console.log('noise: ', noise.simplex2(iterate / 100, iterate / 100));
    //   iterate++;
    // }

    // for ( var i = 0; i < this.scene.children.length; i ++ ) {
    //   var object = this.scene.children[ i ];
    //   if ( object instanceof THREE.Mesh ) {
    //     var points = object.geometry.attributes.position.array;
    //
    //     for(var j = 0; j < points.length; j++) {
    //       if(j % 3 === 0) { //x
    //         // console.log(points[j + 1]);
    //         object.geometry.attributes.position.dynamic = true;
    //         points[j + 1] += theta;
    //         object.geometry.verticesNeedUpdate = true;
    //         // console.log(points[j + 1]);
    //       }
    //     }
    //
    //   };
    // }

    renderer.render(scene, camera);
  }

  function clearScene() {
    for(j = scene.children.length - 1; j >= 0; j--) {
      if(scene.children[j] instanceof THREE.Mesh) {
        scene.remove(scene.children[j]);
      }
    }
  }

  function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }

  function createLine(position, index, variation) {
    var geometry = new THREE.Geometry();
    var index, pointPos;

    var points = createPoints(index);
    var curve = new THREE.CatmullRomCurve3(points);

    for(k = 0; k < points.length * lineSubdivs; k++) {
      index = k / (points.length * lineSubdivs);
      pointPos = curve.getPoint(index);

      geometry.vertices[k] = new THREE.Vector3(pointPos.x, pointPos.y, pointPos.z);
    }

    // createMeshLine(position, geometry);

    createBasicLine(position, geometry);
  }

  function createBasicLine(position, geometry) {
    var material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: 1,
      linewidth: 3
    });

    var line = new THREE.Line(geometry, material);
    line.position.x = position.x;
    line.position.y = position.y;
    line.position.z = position.z;

    line.name = 'line';

    scene.add(line);
  }

  function createMeshLine(position, geometry) {
    var line = new MeshLine();
    line.setGeometry(geometry);

    var material = new MeshLineMaterial({
      color: new THREE.Color(0xffffff),
      resolution: resolution,
      lineWidth: 2,
      near: camera.near,
      far: camera.far,
      depthWrite: false,
      dashArray: new THREE.Vector2(10, 5),
      side: THREE.DoubleSide,
      transparent: true
    });

    var meshline = new THREE.Mesh(line.geometry, material);
    meshline.position.x = position.x;
    meshline.position.y = position.y;
    meshline.position.z = position.z;

    meshline.name = 'line';

    scene.add( meshline );
  }

  function createPoints(index) {
    var pointsArr = [];

    for(l = -500; l<=500; l+=10) {
      pointsArr.push(new THREE.Vector3(l, noise.perlin2(l / 500 * 10, index / 10) * 10, 0));
    }

    return pointsArr;
  }

  function addEvents() {
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    document.querySelector('.finish-btn').addEventListener('click', function(e) {
      console.log('clicked');
    });

    // verticalMinCtrl.onFinishChange(function(value) {
    //   verticalMin = value;
    // });
    // verticalMaxCtrl.onFinishChange(function(value) {
    //   verticalMax = value;
    // });
    // horizontalMinCtrl.onFinishChange(function(value) {
    //   horizontalMin = value;
    // });
    // horizontalMaxCtrl.onFinishChange(function(value) {
    //   horizontalMax = value;
    // });
    // stepCtrl.onFinishChange(function(value) {
    //   step = value;
    // });
  }
})();

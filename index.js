(function() {
  var el = document.querySelector('#root');

  var mouseX = 0, mouseY = 0,
    windowHalfX = window.innerWidth / 2,
	  windowHalfY = window.innerHeight / 2,
    resolution = new THREE.Vector2(window.innerWidth, window.innerHeight),
    time,
    theta = 0,
		camera, scene, renderer, material, composer;

  init();
  animate();
  addEvents();

  function init() {
    time = Date.now();

    var i, container;
    container = document.createElement( 'div' );
    el.appendChild( container );
    camera = new THREE.PerspectiveCamera(
      33,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 700;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    for(var i = -10, j = 10; i < j; i++) {
      var position = new THREE.Vector3(0, i * 10, 0);
      //createLine(position);
    }

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    // for(var i = 0; i < scene.children.length; i++) {
    //   var points = scene.children[i].geometry.attributes.position.array;
    //   for(var j = 0; j < points.length; j++) {
    //     if(j % 3 === 0) { //x
    //       points[j + 1] += 100;
    //     }
    //   }
    // }

    // var points = scene.children[0].geometry.attributes.position;
    //
    // console.log(scene.children[0].geometry.attributes.position);

    noise.seed(Math.random());
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  var test = false;

  function render() {
    theta = Math.round((Date.now() - time) / 100);
    // console.log(theta);

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
    camera.lookAt( scene.position );

    clearScene();

    for (var i = 0; i < 15; i++) {
      createLine(new THREE.Vector3(0, i * 10, 0), theta);
    }

    // for ( var i = 0; i < scene.children.length; i ++ ) {
    //   var object = scene.children[ i ];
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
    for(var i = scene.children.length - 1; i >= 0; i--) {
      if(scene.children[i] instanceof THREE.Mesh) {
        scene.remove(scene.children[i]);
      }
    }
  }

  function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }

  function createLine(position, variation) {
    var geometry = new THREE.Geometry();

    if(variation) {
      var curve = new THREE.SplineCurve(createPoints(-500, 500, 10, variation));
    } else {
      var curve = new THREE.SplineCurve(createPoints(-500, 500, 10));
    }

    var path = new THREE.Path( curve.getPoints( 50 ) );
    geometry = path.createPointsGeometry( 50 );

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

  function createPoints(min, max, step, variation) {
    var pointsArr = [];

    for(var i = min, j = max; i<=j; i+=step) {
      if(variation) {
        pointsArr.push(new THREE.Vector3(i, noise.simplex2(i + 1000, i + 1000) * 10, 0));
      } else {
        pointsArr.push(new THREE.Vector3(i, 0, 0));
      }
    }

    return pointsArr;
  }

  function addEvents() {
    document.querySelector('.finish-btn').addEventListener('click', function(e) {
      console.log('clicked');
    });
  }
})();

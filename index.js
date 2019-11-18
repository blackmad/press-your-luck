/*
Most of the stuff in here is just bootstrapping. Essentially it's just
setting ThreeJS up so that it renders a flat surface upon which to draw
the shader. The only thing to see here really is the uniforms sent to
the shader. Apart from that all of the magic happens in the HTML view
under the fragment shader.
*/

let container;
let camera, scene, renderer;
let uniforms;

let config = {
  mouse_pos: false
};

let loader=new THREE.TextureLoader();
let texture;
let video, videoImage, videoImageContext, videoTexture;
loader.setCrossOrigin("anonymous");
loader.load(
  'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/test-image-1.jpg',
  function do_something_with_texture(tex) {
    texture = tex;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    init();
    animate();
  }
);

function init() {
  container = document.getElementById( 'container' );

	video = document.getElementById( 'monitor' );

	videoImage = document.getElementById( 'videoImage' );
	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

	videoTexture = new THREE.Texture( videoImage );
  videoTexture.wrapS = THREE.MirroredRepeatWrapping;
  videoTexture.wrapT = THREE.MirroredRepeatWrapping;
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;

  camera = new THREE.Camera();
  camera.position.z = 1;

  scene = new THREE.Scene();

  var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_scale: { type: "f", value: 1. },
    u_blades: { type: "i", value: 1 },
    u_texture: { type: "t", value: videoTexture },
    u_rotation: { type: "f", value: 0. },
    u_rotation_k: { type: "f", value: 0. },
    u_pos: { type: "v2", value: new THREE.Vector2(.5,.5) },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_kaleidoscope_distortion: { type: "b", value: true },
    u_droste_distortion: { type: "b", value: false },
    u_droste_rad1: { type: "f", value: .5 },
    u_droste_rad2: { type: "f", value: 1.5 }
  };


  var material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  } );
  material.extensions.derivatives = true;

  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
  renderer.setPixelRatio( 2 );

  container.appendChild( renderer.domElement );

  onWindowResize();
  window.addEventListener( 'resize', onWindowResize, false );

  document.onmousemove = function(e){
    let ratio = window.innerHeight / window.innerWidth;
    uniforms.u_mouse.value.x = (e.pageX - window.innerWidth / 2) / window.innerWidth / ratio;
    uniforms.u_mouse.value.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1;

    if(config.mouse_pos) {

      console.log('mouse pos')
      uniforms.u_pos.value.x = uniforms.u_mouse.value.x % 1;
      uniforms.u_pos.value.y = uniforms.u_mouse.value.y % 1;
    }
  }

  let saveImage = () => {
    let image = renderer.domElement.toDataURL("image/jpeg", .6);

    let img = document.createElement('img');
    let imgcontainer = document.body.querySelector('#image');
    imgcontainer.innerHTML = '';
    imgcontainer.appendChild(img);
    img.src = image;
  }

  const makeDatGui = () => {
    // Dat gui
    var gui = new dat.GUI();
    gui.add(uniforms.u_scale, 'value', .1, 10).name("Scale");
    gui.add(uniforms.u_blades, 'value', 1, 20).name("Blades");
    gui.add(config, 'mouse_pos').name("move on mouse");
    gui.add(uniforms.u_pos.value, 'x', 0, 1).name("x").listen().step(0.01);
    gui.add(uniforms.u_pos.value, 'y', 0, 1).name("y").listen().step(0.01);
    gui.add(uniforms.u_rotation, 'value', -Math.PI, Math.PI).name("texture rotation").step(0.01);
    gui.add(uniforms.u_rotation_k, 'value', -Math.PI, Math.PI).name("rotation").step(0.01);

    gui.add(uniforms.u_kaleidoscope_distortion, 'value').name("kaleidoscope");
    gui.add(uniforms.u_droste_distortion, 'value').name("droste");
    gui.add(uniforms.u_droste_rad1, 'value', -1., 2.).name("droste radius 1").step(0.01);
    gui.add(uniforms.u_droste_rad2, 'value', -1., 2.).name("droste radius 2").step(0.01);

    gui.close();
  }


  setInterval(function(){ 
    // console.log(Math.cos(new Date().getTime() / 1000))
    // const radius = (Math.cos(new Date().getTime() / 1000) + 1.0) /2 
    // uniforms.u_droste_rad1.value = radius;
    // const radius2 = (Math.cos(new Date().getTime() / 1000) + 1.4) /2  
    // // uniforms.u_rotation_k.value = radius2;
    // uniforms.u_blades.value = (radius2*radius2*radius2) * 20;

  }, );



  addListeners(container, 'drag dragstart dragend dragover dragenter dragleave drop', (e)=> {
    e.preventDefault();
    e.stopPropagation();
  });
  addListeners(container, 'dragenter dragover', (e)=> {
    container.classList.add('uploadpending');
  });
  addListeners(container, 'dragleave dragend drop', (e)=> {
    container.classList.remove('uploadpending');
  });
  addListeners(container, 'drop', (e)=> {
    file = e.dataTransfer.files[0];
    if(file.type === 'image/png' || file.type === 'image/jpeg') {
      console.clear();
      console.log(file);
      let reader = new FileReader();
      reader.addEventListener('loadend', (e) => {
        // get file content
        var dataurl = e.target.result;
        console.log(dataurl);
        loader.load(
          dataurl,
          function do_something_with_texture(tex) {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.LinearFilter;
            uniforms.u_texture.value = tex;
          }
        );
      });
      reader.readAsDataURL(file);
    }
  });
}

function onWindowResize( event ) {
  // let w = window.innerWidth;
  // let h = window.innerHeight;
  let w = $('#container').width();
  let h = $('#container').height();

  renderer.setSize( w, h );
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  uniforms.u_time.value += 0.01;
	if ( video.readyState === video.HAVE_ENOUGH_DATA )
	{
		videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
		if ( videoTexture ) {
      videoTexture.needsUpdate = true;
    }
	}
  renderer.render( scene, camera );
}

function addListeners(el, s, fn) {
  s.split(' ').forEach(e => el.addEventListener(e, fn, false));
}

function isIOS() {
  var ua = window.navigator.userAgent;
  return /(iPad|iPhone|iPod).*WebKit/.test(ua) && !/(CriOS|OPiOS)/.test(ua);
}

function onload() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  window.URL = window.URL || window.webkitURL;

  var camvideo = document.getElementById('monitor');


  if (true || isIOS()) {

    var constraints = {
         audio: false,
         video: {
             facingMode: 'user'
         }
    }

     navigator.mediaDevices.getUserMedia(constraints).then((s) => gotStream)

  } else {
    if (!navigator.getUserMedia)
    {
        alert('Sorry. <code>navigator.getUserMedia()</code> is not available.');
    } else {
      navigator.getUserMedia({video: true}, gotStream, noStream);
    }
  }

function gotStream(stream)
{
  console.log('got stream')
 //  debugger;
  // if (window.URL)
  // {   camvideo.src = window.URL.createObjectURL(stream);   }
  // else // Opera
  // {   

    camvideo.srcObject = stream;  

  camvideo.onerror = function(e)
  {   console.log(e);

    stream.stop();   };

  stream.onended = noStream;
}

function noStream(e)
{
  var msg = 'No camera available.';
  if (e.code == 1)
  {   msg = 'User denied access to use camera.';   }
  document.getElementById('errorMessage').textContent = msg;
}
}
const choices = JSON.parse(decodeURIComponent(window.location.search.substring(1)));


$(function(){

  //buttons
  var input = document.getElementById("input");
  var score = 0;
  var spins = 2;
  var arraySelection;
  var $rows = [];
  var chosenCel;
  var whammyCount = 0;

  // decelerating to zero velocity 
  function easeOutQuart (t) { return 1-(--t)*t*t*t }
  const easeInQuart = function (t) { return t*t*t*t }
  const elastic = function(pos) {
    return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
  }

  let animationStartTime = 0;
  const animationTimeInMs = 4000;
  const baseSpeed = 100;
  const minSpeed = 10;
  const maxSpeed = 300;
  const numFinalFrames = 3;
  let finalFrameCount = 0;
  let inAnimation = false;


  function calcWhenNextFrame() {
    const elapsedTime = new Date().getTime() - animationStartTime;
    const scaledT = elapsedTime / animationTimeInMs;

    const candidateSpeed = baseSpeed * (elastic(scaledT));
    if (candidateSpeed < minSpeed) { return minSpeed; }
    if (candidateSpeed > maxSpeed) { return maxSpeed; }
    return candidateSpeed;
  }

  var getContrastYIQ = function(color) {
    var hex = '#';
    var r, g, b;
    if (color.indexOf(hex) > -1) {
      r = parseInt(color.substr(1, 2), 16);
      g = parseInt(color.substr(3, 2), 16);
      b = parseInt(color.substr(5, 2), 16);
    } else {
      color = color.match(/\d+/g);
      r = color[0];
      g = color[1];
      b = color[2];
    }
  
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
  }


  function fillGrid() {
    $rows = $('.cel');
    $rows.removeClass('flash').removeAttr("style").html("");

    $rows.each(function(){
      arraySelection = choices[Math.floor(Math.random()*choices.length)];
      // console.log(arraySelection);

        $(this).css("background-color", arraySelection.color);

        if (arraySelection.fontSize) {
          $(this).append($(`<span style="font-size: ${arraySelection.fontSize}; color: ${arraySelection.textColor}">${arraySelection.name}</span>`));
          // $(this).css("font-size", arraySelection.fontSize)
        } else {
          $(this).html(arraySelection.name);  
          textFit(this);
          arraySelection.fontSize = $(this).find('.textFitted').css('font-size');
          arraySelection.textColor = getContrastYIQ(arraySelection.color)
          console.log(arraySelection.fontSize);
        }
     });
  }

  function blink(){
    console.log('trying to blink');
    uniforms.u_droste_distortion.value = false;
    uniforms.u_blades.value = Math.ceil(Math.random() * 5);
    uniforms.u_scale.value = (Math.random() * 5) + 0.5;
    uniforms.u_droste_distortion.value = false;

    fillGrid();

    chosenCel = $rows[Math.floor(Math.random()*$rows.length)];
    $(chosenCel).addClass('flash');  
    console.log($(chosenCel));
    const elapsedTime = new Date().getTime() - animationStartTime;
    if (elapsedTime > animationTimeInMs) {
      if (finalFrameCount > numFinalFrames) {
        stop()
      } else {
        finalFrameCount+=1;
        setTimeout(blink, maxSpeed);
      }
    } else {
      add = setTimeout(blink,calcWhenNextFrame());
    }
  }

  function start() {
    console.log('start again');
    // event.stopPropagation();
    $(chosenCel).removeClass('flash');
    clearTimeout(flash);
    animationStartTime = new Date().getTime();
    add = setTimeout(blink,500);
    $('#spins').html('<p>Spins: ' + spins + '</p>');
  }

  function checkFreeSpin(){
    clickedCel = chosenCel.attributes.value.value;

    if (clickedCel == -1){
      score = 0;
      spins -= 1;
      addWhammys();    
    } else if (chosenCel.attributes.free_spin.value == 1) {
      score += parseInt(clickedCel);
      spins += 1;
      // console.log(chosenCel.attributes.value.data-free-spin);
    } else {
      score += parseInt(clickedCel);
    };  
  }

  function addWhammys(){
    $('.whammyPic').eq(whammyCount).css('background-image', "url(img/whammy2.png)");
    
    if (whammyCount == 2){
      $('#celMiddle').html("<p>GAME OVER. CLICK BELOW To RESTART</p>");
      console.log("line 99 game over! whammy count: " + whammyCount);
      $('#start').text('RESTART').on('click', reset());
    } else {
      whammyCount++; 
      console.log("line 101 whamy count: " + whammyCount);
    }
  }

  function stop(){
    // event.stopPropagation();
    inAnimation = false;
    clearInterval(add);
    // checkFreeSpin();  
    finalFrameCount = 0;

    flash(chosenCel, 5, 100);
    flashWinner(chosenCel);
  }


  var maxBigFlashTimes = 10;
  var bigFlashSpeed = 150;
  var bigFlashTimes = 0;
  function flashWinner(elem) {
    winnerName = $(elem).find('span').text();
    textColor = $(elem).find('span').css('color');
    bgColor = $(elem).css('background-color');
    if (bigFlashTimes % 2 == 0) {
      tmp = textColor
      textColor = bgColor
      bgColor = tmp;
    }

    const $el  = $('#winnerBanner')
    $el.show();
    $el.css('color', textColor)
    $el.css('background-color', bgColor)
    $el.html(winnerName);
    textFit($el);

    if (bigFlashTimes > maxBigFlashTimes) {
      $el.hide();
    } else {
      setTimeout(() => flashWinner(elem), bigFlashSpeed);
    }

    bigFlashTimes += 1;
  }

  function flash(elem, times, speed) {
      if (times > 0 || times < 0) {
          if ($(elem).hasClass("flash")) 
              $(elem).removeClass("flash");
          else
              $(elem).addClass("flash");
      }

      clearTimeout(function () {
          flash(elem, times, speed);
      });

      if (times > 0 || times < 0) {
          setTimeout(function () {
              flash(elem, times, speed);
          }, speed);
          times -= .5;
      }
  }

  function reset(){
    score = 0;
    spins = 2;
    $rows = [];
    whammyCount = 0;
  }


  $('#target').on('click',function(){
    if (!inAnimation) {
      start(event);
    }
    // if($(this).attr('data-click-state') == 1) {
    //   $(this).attr('data-click-state', 0)
    //   stop(event);
    // } else {
    //   $(this).attr('data-click-state', 1)
    //   start(event);
    // }    
  });

  fillGrid();

});

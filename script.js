let choices =  [
{
  name: 'option1',
  color: '#ff0000'
},
{
  name: 'option2',
  color: '#00ff00'
},
{
  name: 'option3',
  color: '#0000ff'
}
]
if (window.location.search.substring(1).length > 1) {
  choices = JSON.parse(
    decodeURIComponent(window.location.search.substring(1))
  );
}

$(document).ready(function() {
  //buttons
  var input = document.getElementById("input");
  var score = 0;
  var spins = 2;
  var arraySelection;
  var $rows = [];
  var chosenCel;
  var whammyCount = 0;

  // decelerating to zero velocity
  function easeOutQuart(t) {
    return 1 - --t * t * t * t;
  }
  const easeInQuart = function(t) {
    return t * t * t * t;
  };
  const elastic = function(pos) {
    return (
      -1 *
        Math.pow(4, -8 * pos) *
        Math.sin(((pos * 6 - 1) * (2 * Math.PI)) / 2) +
      1
    );
  };

  const baseSpeed = 70;
  const minSpeed = 100;
  const maxSpeed = 300;
  const numFinalFrames = 3;
  let finalFrameCount = 0;
  let inAnimation = false;
  let inStopAnimation = false;
  let stopAnimationStartTime = 0;
  const stopAnimationTimeInMs = 1500;

  function calcWhenNextFrame() {
    const elapsedTime = new Date().getTime() - stopAnimationStartTime;
    const scaledT = elapsedTime / stopAnimationTimeInMs;

    const candidateSpeed = baseSpeed * elastic(scaledT);
    if (candidateSpeed < minSpeed) {
      return minSpeed;
    }
    if (candidateSpeed > maxSpeed) {
      return maxSpeed;
    }
    return candidateSpeed;
  }

  window.reinitCameraVars = () => {
    uniforms.u_blades.value = 1;
    uniforms.u_scale.value = 1;
    uniforms.u_pos.value.x = 0.5;
    uniforms.u_pos.value.y = 0.5;
  };

  var getContrastYIQ = function(color) {
    var hex = "#";
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

    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  };

  function fillGrid() {
    $rows = $(".cel");
    $rows
      .removeClass("flash")
      .removeAttr("style")
      .html("");

    $rows.each(function() {
      arraySelection = choices[Math.floor(Math.random() * choices.length)];
      // console.log(arraySelection);

      $(this).css("background-color", arraySelection.color);

      if (arraySelection.fontSize) {
        $(this).append(
          $(
            `<span style="font-size: ${arraySelection.fontSize}; color: ${arraySelection.textColor}">${arraySelection.name}</span>`
          )
        );
        // $(this).css("font-size", arraySelection.fontSize)
      } else {
        $(this).html(arraySelection.name);
        textFit(this);
        arraySelection.fontSize = $(this)
          .find(".textFitted")
          .css("font-size");
        arraySelection.textColor = getContrastYIQ(arraySelection.color);
        console.log(arraySelection.fontSize);
      }
    });
  }

  function blink() {
    uniforms.u_droste_distortion.value = false;
    uniforms.u_blades.value = Math.ceil(Math.random() * 20);
    uniforms.u_scale.value = Math.random() * 3 + 0.8;
    uniforms.u_droste_distortion.value = false;

    fillGrid();

    chosenCel = $rows[Math.floor(Math.random() * $rows.length)];
    $(chosenCel).addClass("flash");
    if (inStopAnimation) {
      const elapsedTime = new Date().getTime() - stopAnimationStartTime;
      if (elapsedTime > stopAnimationTimeInMs) {
        if (finalFrameCount > numFinalFrames) {
          stop();
        } else {
          finalFrameCount += 1;
          setTimeout(blink, 200 * finalFrameCount);
        }
      } else {
        add = setTimeout(blink, calcWhenNextFrame());
      }
    } else {
      setTimeout(blink, minSpeed);
    }
  }

  function start() {
    console.log("start again");
    $(chosenCel).removeClass("flash");
    clearTimeout(flash);
    add = setTimeout(blink, 500);
  }

  function addWhammys() {
    $(".whammyPic")
      .eq(whammyCount)
      .css("background-image", "url(img/whammy2.png)");

    if (whammyCount == 2) {
      $("#celMiddle").html("<p>GAME OVER. CLICK BELOW To RESTART</p>");
      console.log("line 99 game over! whammy count: " + whammyCount);
      $("#start")
        .text("RESTART")
        .on("click", reset());
    } else {
      whammyCount++;
      console.log("line 101 whamy count: " + whammyCount);
    }
  }

  function stop() {
    // event.stopPropagation();
    inAnimation = false;
    inStopAnimation = false;
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
    winnerName = $(elem)
      .find("span")
      .text();
    textColor = $(elem)
      .find("span")
      .css("color");
    bgColor = $(elem).css("background-color");
    if (bigFlashTimes % 2 == 0) {
      tmp = textColor;
      textColor = bgColor;
      bgColor = tmp;
    }

    const $el = $("#winnerBanner");
    $el.show();
    $el.css("z-index", 1000);
    $el.css("color", textColor);
    $el.css("background-color", bgColor);
    $el.html(winnerName);
    textFit($el);

    if (bigFlashTimes > maxBigFlashTimes) {
      bigFlashTimes = 0;
      $el.hide();
      $el.css("z-index", -1);

      reinitCameraVars();
    } else {
      setTimeout(() => flashWinner(elem), bigFlashSpeed);
    }

    bigFlashTimes += 1;
  }

  function flash(elem, times, speed) {
    if (times > 0 || times < 0) {
      if ($(elem).hasClass("flash")) $(elem).removeClass("flash");
      else $(elem).addClass("flash");
    }

    clearTimeout(function() {
      flash(elem, times, speed);
    });

    if (times > 0 || times < 0) {
      setTimeout(function() {
        flash(elem, times, speed);
      }, speed);
      times -= 0.5;
    }
  }

  function reset() {
    score = 0;
    spins = 2;
    $rows = [];
    whammyCount = 0;
  }

  function startStopping() {
    stopAnimationStartTime = new Date().getTime();
    inStopAnimation = true;
  }

  const calculateScale = () => {
    const boardSize = 600;
    wScale = window.innerWidth / boardSize
    hScale = window.innerHeight / boardSize
    scale = wScale > hScale ? hScale : wScale;
    $('body').css('-webkit-transform-origin', 'top')
    $('body').css('transform', `scale(${scale})`);
  }

  console.log("attaching button handler");

  const handleClick = () => {
    console.log("lcick", inAnimation);
    if (!inAnimation) {
      console.log("starting");
      inAnimation = true;
      start(event);
    } else {
      console.log("stopping");
      startStopping(event);
    }
    // if($(this).attr('data-click-state') == 1) {
    //   $(this).attr('data-click-state', 0)
    //   stop(event);
    // } else {
    //   $(this).attr('data-click-state', 1)
    //   start(event);
    // }
  };

  $("#target").on("click", handleClick);

  $(document).on("keypress", function(e) {
    if (e.which == 13) {
      handleClick();
    }
  });

  fillGrid();
  calculateScale();

  var mc = new Hammer.Manager($('body')[0], {});
  mc.add( new Hammer.Tap({ event: 'singletap', taps: 1 }) );
  mc.on("singletap", handleClick);

});
